from pyteal import *


def approval_program():
    """Savings-goal contract implementation.

    Local state (per user):
      - goal_target: uint64 (target amount)
      - saved: uint64 (current saved amount)

    Methods:
      - set_goal     : set `goal_target` for sender (arg1)
      - deposit_goal : grouped payment to app; increments sender's `saved`
      - withdraw     : user withdraws up to their `saved` (arg1)
      - get_status   : noop (read-only)
    """

    goal_key = Bytes("goal_target")
    saved_key = Bytes("saved")

    on_create = Seq([
        Approve(),
    ])

    # set a savings goal for the sender
    set_goal = Seq([
        Assert(Txn.application_args.length() >= Int(2)),
        App.localPut(Txn.sender(), goal_key, Btoi(Txn.application_args[1])),
        # initialize saved if not present
        App.localPut(Txn.sender(), saved_key, App.localGet(Txn.sender(), saved_key)),
        Approve(),
    ])

    # deposit_goal: grouped tx where previous txn is Payment to this app from the depositor
    deposit_goal = Seq([
        Assert(Global.group_size() >= Int(2)),
        Assert(Gtxn[Txn.group_index() - Int(1)].type_enum() == TxnType.Payment),
        Assert(Gtxn[Txn.group_index() - Int(1)].receiver() == Global.current_application_address()),
        depositor = Gtxn[Txn.group_index() - Int(1)].sender(),
        paid_amt = Gtxn[Txn.group_index() - Int(1)].amount(),
        # require depositor to have opted-in (local state exists) -- App.localGet will error otherwise
        App.localPut(depositor, saved_key, App.localGet(depositor, saved_key) + paid_amt),
        Approve(),
    ])

    # withdraw: user withdraws funds they previously saved
    withdraw = Seq([
        Assert(Txn.application_args.length() >= Int(2)),
        amt = Btoi(Txn.application_args[1]),
        saved = App.localGet(Txn.sender(), saved_key),
        Assert(amt <= saved),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender(),
            TxnField.amount: amt,
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        App.localPut(Txn.sender(), saved_key, saved - amt),
        Approve(),
    ])

    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("set_goal"), set_goal],
        [Txn.application_args[0] == Bytes("deposit_goal"), deposit_goal],
        [Txn.application_args[0] == Bytes("withdraw"), withdraw],
        [Txn.application_args[0] == Bytes("get_status"), Approve()],
    )

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
    )

    return program


def clear_program():
    return Approve()


def compile_teal_program():
    return compileTeal(approval_program(), mode=Mode.Application, version=6), compileTeal(clear_program(), mode=Mode.Application, version=6)


if __name__ == "__main__":
    apr, clr = compile_teal_program()
    print("-- Approval Teal --")
    print(apr)
    print("-- Clear Teal --")
    print(clr)
