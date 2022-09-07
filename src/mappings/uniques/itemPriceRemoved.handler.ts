import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  EventType,
  Status,
  UniqueInstance,
} from '../../model/generated'
import * as events from '../../types/events'
import {
  createEvent,
  getItemId,
} from '../helpers'

export interface IUniquesItemPriceRemoved {
  classId: number
  instanceId: number
}

function getUniquesItemPriceRemovedData(
  ctx: EventHandlerContext<Store>
): IUniquesItemPriceRemoved {
  const event = new events.UniquesItemPriceRemovedEvent(ctx)

  if (event.isV9270) {
    const { collection: classId, item: instanceId } = event.asV9270
    return { classId, instanceId }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId, item: instanceId } = ctx._chain.decodeEvent(
    ctx.event
  )
  return { classId, instanceId }
}

export async function uniqueItemPriceRemoved(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesItemPriceRemovedData(ctx)
  const { classId, instanceId } = eventData

  const uniqueInstance = await ctx.store.get(
    UniqueInstance,
    getItemId(classId, instanceId)
  )
  assert(uniqueInstance)
  uniqueInstance.price = 0n
  uniqueInstance.status = Status.ACTIVE
  await ctx.store.save(uniqueInstance)

  const event = createEvent(ctx, {
    type: EventType.PRICE_REMOVED,
    uniqueInstance,
  })
  await ctx.store.save(event)
}
