import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  Attribute,
  EventType,
  UniqueClass,
  UniqueInstance,
} from '../../model/generated'
import * as events from '../../types/events'
import {
  createEvent,
  getItemId,
} from '../helpers'

export interface IUniquesAttributeSet {
  classId: number
  instanceId?: number
  key: Uint8Array
  value: Uint8Array
}

function getUniquesAttributeSetData(
  ctx: EventHandlerContext<Store>
): IUniquesAttributeSet {
  const event = new events.UniquesAttributeSetEvent(ctx)
  if (event.isV1) {
    const [classId, instanceId, key, value] = event.asV1
    return { classId, instanceId, key, value }
  }
  if (event.isV700) {
    const {
      class: classId,
      maybeInstance: instanceId,
      key,
      value,
    } = event.asV700
    return { classId, instanceId, key, value }
  }
  if (event.isV9230) {
    const {
      collection: classId,
      maybeItem: instanceId,
      key,
      value,
    } = event.asV9230
    return { classId, instanceId, key, value }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    maybeItem: instanceId,
    key,
    value,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, instanceId, key, value }
}

export async function uniqueAttributeSet(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesAttributeSetData(ctx)
  const { classId, instanceId, key, value } = eventData
  const entity = instanceId
    ? await ctx.store.get(UniqueInstance, getItemId(classId, instanceId))
    : await ctx.store.get(UniqueClass, classId.toString())
  assert(entity)

  const keyStr = key.toString()
  const valueStr = value.toString()
  const attrIndex = entity.attributes.findIndex((attr) => attr.key === keyStr)
  if (attrIndex === -1)
    entity.attributes.push(new Attribute({ key: keyStr, value: valueStr }))
  else entity.attributes[attrIndex].value = valueStr
  await ctx.store.save(entity)

  const event = createEvent(ctx, {
    type: EventType.ATTRIBUTE_SET,
  })
  if (entity instanceof UniqueInstance) event.uniqueInstance = entity
  else event.uniqueClass = entity
  await ctx.store.save(event)
  
}
