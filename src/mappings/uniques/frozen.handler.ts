import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  EventType,
  Status,
  UniqueInstance,
} from '../../model/generated'
import * as events from '../../types/events'
import { createEvent, getItemId } from '../helpers'

interface IUniquesFrozenData {
  classId: number
  instanceId: number
}

function getUniquesFrozenData(
  ctx: EventHandlerContext<Store>
): IUniquesFrozenData {
  const event = new events.UniquesFrozenEvent(ctx)
  if (event.isV1) {
    const [classId, instanceId] = event.asV1
    return { classId, instanceId }
  }
  if (event.isV700) {
    const { class: classId, instance: instanceId } = event.asV700
    return { classId, instanceId }
  }
  if (event.isV9230) {
    const { collection: classId, item: instanceId } = event.asV9230
    return { classId, instanceId }
  }
  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId, item: instanceId } = ctx._chain.decodeEvent(
    ctx.event
  )
  return { classId, instanceId }
}

export async function uniqueFrozen(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesFrozenData(ctx)
  const { classId, instanceId } = eventData
  const uniqueInstance = await ctx.store.get(
    UniqueInstance,
    getItemId(classId, instanceId)
  )
  assert(uniqueInstance)

  uniqueInstance.status = Status.FROZEN
  await ctx.store.save(uniqueInstance)

  const event = createEvent(ctx, {
    uniqueInstance,
    type: EventType.FREEZE,
  })

  await ctx.store.save(event)
}
