import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  AccountTransfer,
  Direction,
  EventType,
  Status,
  UniqueInstance,
} from '../../model/generated'
import * as events from '../../types/events'
import {
  createEvent,
  encodeId,
  getItemId,
  getOrCreateAccount,
} from '../helpers'

interface IUniquesTransferredData {
  classId: number
  instanceId: number
  from: Uint8Array
  to: Uint8Array
}

function getUniquesTransferredData(
  ctx: EventHandlerContext<Store>
): IUniquesTransferredData {
  const event = new events.UniquesTransferredEvent(ctx)
  if (event.isV1) {
    const [classId, instanceId, from, to] = event.asV1
    return { classId, instanceId, from, to }
  }
  if (event.isV700) {
    const { class: classId, instance: instanceId, from, to } = event.asV700
    return { classId, instanceId, from, to }
  }
  if (event.isV9230) {
    const { collection: classId, item: instanceId, from, to } = event.asV9230
    return { classId, instanceId, from, to }
  }
  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    item: instanceId,
    from,
    to,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, instanceId, from, to }
}

export async function uniqueTransferred(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const { classId, instanceId, from, to } = getUniquesTransferredData(ctx)
  const fromId = encodeId(from)
  const toId = encodeId(to)

  const [uniqueInstance, fromAccount, toAccount] = await Promise.all([
    ctx.store.get(UniqueInstance, getItemId(classId, instanceId)),
    getOrCreateAccount(ctx.store, fromId),
    getOrCreateAccount(ctx.store, toId),
  ])

  assert(uniqueInstance)
  uniqueInstance.owner = toAccount
  uniqueInstance.price = 0n
  if (uniqueInstance.status === Status.LISTED)
    uniqueInstance.status = Status.ACTIVE
  await ctx.store.save(uniqueInstance)

  const event = createEvent(ctx, {
    uniqueInstance,
    type: EventType.TRNASFER,
    from: fromId,
    to: toId,
  })

  await ctx.store.save(event)

  const fromTransfer = new AccountTransfer({
    id: `${ctx.event.id}-FROM`,
    event,
    direction: Direction.FROM,
    account: fromAccount,
  })

  const toTransfer = new AccountTransfer({
    id: `${ctx.event.id}-TO`,
    event,
    account: toAccount,
    direction: Direction.TO,
  })

  await ctx.store.save(fromTransfer)
  await ctx.store.save(toTransfer)
}
