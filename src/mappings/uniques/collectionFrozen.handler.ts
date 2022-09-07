import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { EventType, Status } from '../../model/generated'
import * as events from '../../types/events'
import {
  IUniquesClassId,
  processClassStateChange,
} from '../helpers'

function getUniquesCollectionFrozenData(
  ctx: EventHandlerContext<Store>
): IUniquesClassId {
  const event = new events.UniquesCollectionFrozenEvent(ctx)
  if (event.isV9230) {
    const { collection: classId } = event.asV9230
    return { classId }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId } = ctx._chain.decodeEvent(ctx.event)
  return { classId }
}

export const uniqueCollectionFrozen = (
  ctx: EventHandlerContext<Store>
): Promise<void> =>
  processClassStateChange(
    ctx,
    getUniquesCollectionFrozenData,
    Status.FROZEN,
    EventType.FREEZE
  )
