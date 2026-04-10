from pyteal import *


def approval_program():
    """Complete Payment contract implementation.

    Global state:
      - owner: bytes (creator)
      - total: uint64 (total deposited)

    Methods (via first application arg):
      - deposit     : grouped Payment to app, increments `total`
      - pay         : owner-only, inner payment to Accounts[1], arg1 = amount
      - withdraw    : owner-only, inner payment to owner, arg1 = amount
      - balance     : noop (read-only)
      - get_owner   : noop (read-only)
    """

    owner_key = Bytes("owner")
    total_key = Bytes("total")

    on_create = Seq([
        App.globalPut(owner_key, Txn.sender()),
        App.globalPut(total_key, Int(0)),
        Approve(),
    ])

    # deposit: grouped tx where previous txn is Payment to this app
    deposit = Seq([
        Assert(Global.group_size() >= Int(2)),
        Assert(Gtxn[Txn.group_index() - Int(1)].type_enum() == TxnType.Payment),
        Assert(Gtxn[Txn.group_index() - Int(1)].receiver() == Global.current_application_address()),
        Assert(Gtxn[Txn.group_index() - Int(1)].amount() > Int(0)),
        App.globalPut(total_key, App.globalGet(total_key) + Gtxn[Txn.group_index() - Int(1)].amount()),
        Approve(),
    ])

    # pay: owner-only inner payment to Accounts[1], amount = Btoi(arg1)
    pay = Seq([
        Assert(Txn.sender() == App.globalGet(owner_key)),
        Assert(Txn.application_args.length() >= Int(2)),
        Assert(Txn.accounts.length() >= Int(2)),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.accounts[1],
            TxnField.amount: Btoi(Txn.application_args[1]),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        App.globalPut(total_key, App.globalGet(total_key) - Btoi(Txn.application_args[1])),
        Approve(),
    ])

    # withdraw: owner-only inner payment to owner
    withdraw = Seq([
        Assert(Txn.sender() == App.globalGet(owner_key)),
        Assert(Txn.application_args.length() >= Int(2)),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: App.globalGet(owner_key),
            TxnField.amount: Btoi(Txn.application_args[1]),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        App.globalPut(total_key, App.globalGet(total_key) - Btoi(Txn.application_args[1])),
        Approve(),
    ])

    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("deposit"), deposit],
        [Txn.application_args[0] == Bytes("pay"), pay],
        [Txn.application_args[0] == Bytes("withdraw"), withdraw],
        [Txn.application_args[0] == Bytes("balance"), Approve()],
        [Txn.application_args[0] == Bytes("get_owner"), Approve()],
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
