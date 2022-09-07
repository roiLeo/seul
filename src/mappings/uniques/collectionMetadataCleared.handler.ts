import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import {
  EventType,
} from '../../model/generated'
import * as events from '../../types/events'
import {
  IUniquesClassMetaChange,
  processChangeClassMetadata,
} from '../helpers'

function getUniquesCollectionMetadataClearedData(
  ctx: EventHandlerContext<Store>
): IUniquesClassMetaChange {
  const event = new events.UniquesCollectionMetadataClearedEvent(ctx)
  if (event.isV9230) {
    const { collection: classId } = event.asV9230
    return { classId }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId } = ctx._chain.decodeEvent(ctx.event)
  return { classId }
}

export const uniqueCollectionMetadataCleared = async (
  ctx: EventHandlerContext<Store>
): Promise<void> =>
  processChangeClassMetadata(
    ctx,
    getUniquesCollectionMetadataClearedData,
    EventType.METADATA_CLEAR
  )
