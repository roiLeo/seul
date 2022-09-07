import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  EventType,
  UniqueClass,
} from '../../model/generated'
import * as events from '../../types/events'
import {
  createEvent,
  encodeId,
} from '../helpers'

export interface IUniquesOwnerChanged {
  classId: number
  newOwner: Uint8Array
}

function getUniquesOwnerChangedData(
  ctx: EventHandlerContext<Store>
): IUniquesOwnerChanged {
  const event = new events.UniquesOwnerChangedEvent(ctx)
  if (event.isV1) {
    const [classId, newOwner] = event.asV1
    return { classId, newOwner }
  }
  if (event.isV700) {
    const { class: classId, newOwner } = event.asV700
    return { classId, newOwner }
  }
  if (event.isV9230) {
    const { collection: classId, newOwner } = event.asV9230
    return { classId, newOwner }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId, newOwner } = ctx._chain.decodeEvent(ctx.event)
  return { classId, newOwner }
}

export async function uniqueOwnerChanged(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesOwnerChangedData(ctx)
  const { classId, newOwner } = eventData

  const uniqueClass = await ctx.store.get(UniqueClass, classId.toString())
  assert(uniqueClass)
  uniqueClass.owner = encodeId(newOwner)
  await ctx.store.save(uniqueClass)

  const event = createEvent(ctx, {
    type: EventType.OWNER_CHANGE,
    uniqueClass,
  })
  await ctx.store.save(event)
}
