import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import { EventType, UniqueClass, UniqueInstance } from '../../model/generated'
import * as events from '../../types/events'
import { createEvent, getItemId } from '../helpers'

export interface IUniquesAttributeCleared {
  classId: number
  instanceId?: number
  key: Uint8Array
}

function getUniquesAttributeClearedData(
  ctx: EventHandlerContext<Store>
): IUniquesAttributeCleared {
  const event = new events.UniquesAttributeClearedEvent(ctx)
  if (event.isV1) {
    const [classId, instanceId, key] = event.asV1
    return { classId, instanceId, key }
  }
  if (event.isV700) {
    const { class: classId, maybeInstance: instanceId, key } = event.asV700
    return { classId, instanceId, key }
  }
  if (event.isV9230) {
    const { collection: classId, maybeItem: instanceId, key } = event.asV9230
    return { classId, instanceId, key }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    maybeItem: instanceId,
    key,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, instanceId, key }
}

export async function uniqueAttributeCleared(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesAttributeClearedData(ctx)
  const { classId, instanceId, key } = eventData
  const entity = instanceId
    ? await ctx.store.get(UniqueInstance, getItemId(classId, instanceId))
    : await ctx.store.get(UniqueClass, classId.toString())
  assert(entity)

  entity.attributes = entity.attributes.filter(
    (attr) => attr.key !== key.toString()
  )
  await ctx.store.save(entity)

  const event = createEvent(ctx, {
    type: EventType.ATTRIBUTE_CLEAR,
  })
  if (entity instanceof UniqueInstance) event.uniqueInstance = entity
  else event.uniqueClass = entity
  await ctx.store.save(event)
}
