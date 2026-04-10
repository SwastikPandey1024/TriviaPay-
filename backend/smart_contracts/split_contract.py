from pyteal import *


def approval_program():
    """Bill-splitting contract implementation (simplified).

    Global state:
      - owner: bytes (creator / manager)
      - split_count: uint64 (counter for created splits)

    Local state (per user):
      - owed: uint64 (amount owed to this account)

    Methods:
      - create_split : owner increments split counter
      - join_split   : user opt-in / no-op here
      - settle       : grouped Payment credited to Txn.accounts[1] local `owed`
      - withdraw     : user withdraws `owed` (arg: amount)
    """

    owner_key = Bytes("owner")
    split_count_key = Bytes("split_count")
    owed_key = Bytes("owed")

    on_create = Seq([
        App.globalPut(owner_key, Txn.sender()),
        App.globalPut(split_count_key, Int(0)),
        Approve(),
    ])

    # owner-only: increment split counter
    create_split = Seq([
        Assert(Txn.sender() == App.globalGet(owner_key)),
        App.globalPut(split_count_key, App.globalGet(split_count_key) + Int(1)),
        Approve(),
    ])

    # join_split: users should opt-in to enable local state; this handler is a no-op approval
    join_split = Seq([
        Approve(),
    ])

    # settle: grouped txn where previous txn is payment to this app; credits local `owed` for Accounts[1]
    settle = Seq([
        Assert(Global.group_size() >= Int(2)),
        Assert(Gtxn[Txn.group_index() - Int(1)].type_enum() == TxnType.Payment),
        Assert(Gtxn[Txn.group_index() - Int(1)].receiver() == Global.current_application_address()),
        # recipient must be provided in Accounts[1]
        Assert(Txn.accounts.length() >= Int(2)),
        recipient = Txn.accounts[1],
        paid_amt = Gtxn[Txn.group_index() - Int(1)].amount(),
        App.localPut(recipient, owed_key, App.localGet(recipient, owed_key) + paid_amt),
        Approve(),
    ])

    # withdraw: user withdraws up to their owed balance
    withdraw = Seq([
        Assert(Txn.application_args.length() >= Int(2)),
        withdraw_amt = Btoi(Txn.application_args[1]),
        owed = App.localGet(Txn.sender(), owed_key),
        Assert(withdraw_amt <= owed),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender(),
            TxnField.amount: withdraw_amt,
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        App.localPut(Txn.sender(), owed_key, owed - withdraw_amt),
        Approve(),
    ])

    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("create_split"), create_split],
        [Txn.application_args[0] == Bytes("join_split"), join_split],
        [Txn.application_args[0] == Bytes("settle"), settle],
        [Txn.application_args[0] == Bytes("withdraw"), withdraw],
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
