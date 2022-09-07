import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { EventType, Status } from '../../model/generated'
import * as events from '../../types/events'
import {
  IUniquesClassId,
  processClassStateChange,
} from '../helpers'

function getUniquesDestroyedData(
  ctx: EventHandlerContext<Store>
): IUniquesClassId {
  const event = new events.UniquesDestroyedEvent(ctx)
  if (event.isV1) {
    const classId = event.asV1
    return { classId }
  }
  if (event.isV700) {
    const { class: classId } = event.asV700
    return { classId }
  }
  if (event.isV9230) {
    const { collection: classId } = event.asV9230
    return { classId }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId } = ctx._chain.decodeEvent(ctx.event)
  return { classId }
}

export const uniqueClassDestroyed = (
  ctx: EventHandlerContext<Store>
): Promise<void> =>
  processClassStateChange(
    ctx,
    getUniquesDestroyedData,
    Status.DESTROYED,
    EventType.DESTROY
  )
