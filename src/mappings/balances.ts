import { EventHandlerContext } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import { Account, HistoricalBalance, Transfer, TransferType } from "../model";

import { BalancesDepositEvent, BalancesTransferEvent } from "../types/events";
import { encodeId, get, getOrCreate, isAdressSS58 } from "./helpers/entity-utils";

export async function balancesTransfer(ctx: EventHandlerContext<Store>) {
  let event = new BalancesTransferEvent(ctx);
  if (event.isV1) {
    var [fromA, toA, value] = event.asV1;
  }
  else if (event.isV700) {
    var {from: fromA, to: toA, amount: value} = event.asV700;
  }
  else {
    throw event.constructor.name;
  }

  const tip = ctx.event.extrinsic?.tip || 0n;
  let to = isAdressSS58(toA) ? encodeId(toA) : null;
  let from = isAdressSS58(fromA) ? encodeId(fromA) : null;
  if (!to || !from) return;
  const fromAcc = await getOrCreate(ctx.store, Account, from);
  fromAcc.wallet = from;
  fromAcc.balance = fromAcc.balance || 0n;
  fromAcc.balance -= value;
  fromAcc.balance -= tip;
  await ctx.store.save(fromAcc);

  const toAcc = await getOrCreate(ctx.store, Account, to);
  toAcc.wallet = to;
  toAcc.balance = toAcc.balance || 0n;
  toAcc.balance += value;
  await ctx.store.save(toAcc);

  const hbFrom = new HistoricalBalance();
  hbFrom.id = ctx.event.id + 'from';
  hbFrom.account = fromAcc;
  hbFrom.balance = fromAcc.balance;
  hbFrom.timestamp = new Date(ctx.block.timestamp);
  await ctx.store.save(hbFrom);

  const hbTo = new HistoricalBalance();
  hbTo.id = ctx.event.id + 'to';
  hbTo.account = toAcc;
  hbTo.balance = toAcc.balance;
  hbTo.timestamp = new Date(ctx.block.timestamp);
  await ctx.store.save(hbTo);

  const transfer = new Transfer();
  transfer.id = ctx.event.id + 'transfer';
  transfer.amount = value;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.from = from;
  transfer.to = to;
  transfer.success = true;
  transfer.id = ctx.event.id;
  transfer.type = TransferType.REGULAR;
  transfer.createdAt = new Date(ctx.block.timestamp);

  await ctx.store.save(transfer);
}

export async function transferFee(ctx: EventHandlerContext<Store>) {
  let event = new BalancesDepositEvent(ctx);
  if (event.isV1) {
    var [, fees] = event.asV1;
  }
  else if (event.isV700) {
    var {who, amount: fees} = event.asV700;
  }
  else {
    throw event.constructor.name;
  }

  if (ctx.event.extrinsic?.id) {
    const transfer = await get(ctx.store, Transfer, ctx.event.extrinsic?.id);
    if (!transfer) {
      // console.error("No transfer found for deposit event", event.id);
      return;
    }
    transfer.fee = fees;
    await ctx.store.save(transfer);
  } else {
    console.error("Extrinsic Null for deposit event ", ctx.event.id);
  }
}
