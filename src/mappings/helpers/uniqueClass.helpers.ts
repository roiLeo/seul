import assert from 'assert'
import { Store } from '@subsquid/typeorm-store/lib/store'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import { EventType, Status, UniqueClass } from '../../model/generated'
import { createEvent } from './common.helpers'

export interface IUniquesClassId {
  classId: number
}

export async function processClassStateChange(
  ctx: EventHandlerContext<Store>,
  dataGetter: (ctx: EventHandlerContext<Store>) => IUniquesClassId,
  classStatus: Status,
  eventType: EventType
): Promise<void> {
  const eventData = dataGetter(ctx)
  const uniqueClass = await ctx.store.get(
    UniqueClass,
    eventData.classId.toString()
  )
  assert(uniqueClass)
  uniqueClass.status = classStatus
  await ctx.store.save(uniqueClass)
  const event = createEvent(ctx, {
    uniqueClass,
    type: eventType,
  })
  await ctx.store.save(event)
}

export interface IUniquesClassMetaChange {
  classId: number
  data?: Uint8Array
  isFrozen?: boolean
}

export async function processChangeClassMetadata(
  ctx: EventHandlerContext<Store>,
  dataGetter: (ctx: EventHandlerContext<Store>) => IUniquesClassMetaChange,
  eventType: EventType.METADATA_SET | EventType.METADATA_CLEAR
): Promise<void> {
  const { classId, data, isFrozen } = dataGetter(ctx)
  const uniqueClass = await ctx.store.get(UniqueClass, classId.toString())
  assert(uniqueClass)
  if (eventType === EventType.METADATA_SET) {
    assert(data && isFrozen !== undefined)
    uniqueClass.metadata = data.toString()
    uniqueClass.status = isFrozen ? Status.FROZEN : Status.ACTIVE
  } else {
    uniqueClass.metadata = null
  }
  await ctx.store.save(uniqueClass)
  const event = createEvent(ctx, { uniqueClass, type: eventType })
  await ctx.store.save(event)
}
