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

interface IUniquesBurnedData {
  classId: number
  instanceId: number
  owner: Uint8Array
}

function getUniquesBurnedData(
  ctx: EventHandlerContext<Store>
): IUniquesBurnedData {
  const event = new events.UniquesBurnedEvent(ctx)
  if (event.isV1) {
    const [classId, instanceId, owner] = event.asV1
    return { classId, instanceId, owner }
  }
  if (event.isV700) {
    const { class: classId, instance: instanceId, owner } = event.asV700
    return { classId, instanceId, owner }
  }
  if (event.isV9230) {
    const { collection: classId, item: instanceId, owner } = event.asV9230
    return { classId, instanceId, owner }
  }
  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    item: instanceId,
    owner,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, instanceId, owner }
}

export async function uniqueBurned(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesBurnedData(ctx)
  const { classId, instanceId } = eventData
  const ownerId = encodeId(eventData.owner)
  const [owner, uniqueInstance] = await Promise.all([
    getOrCreateAccount(ctx.store, ownerId),
    ctx.store.get(UniqueInstance, getItemId(classId, instanceId)),
  ])

  assert(uniqueInstance)

  uniqueInstance.status = Status.DESTROYED

  await ctx.store.save(uniqueInstance)

  const event = createEvent(ctx, {
    uniqueInstance,
    type: EventType.DESTROY,
    from: ownerId,
  })

  await ctx.store.save(event)

  const fromTransfer = new AccountTransfer({
    id: `${ctx.event.id}-FROM`,
    event,
    account: owner,
    direction: Direction.FROM,
  })
  await ctx.store.save(fromTransfer)
}
