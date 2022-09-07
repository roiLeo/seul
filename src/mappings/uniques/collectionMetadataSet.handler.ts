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

function getUniquesCollectionMetadataSetData(
  ctx: EventHandlerContext<Store>
): IUniquesClassMetaChange {
  const event = new events.UniquesCollectionMetadataSetEvent(ctx)
  if (event.isV9230) {
    const { collection: classId, data, isFrozen } = event.asV9230
    return { classId, data, isFrozen }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    data,
    isFrozen,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, data, isFrozen }
}

export const uniqueCollectionMetadataSet = async (
  ctx: EventHandlerContext<Store>
): Promise<void> =>
  processChangeClassMetadata(
    ctx,
    getUniquesCollectionMetadataSetData,
    EventType.METADATA_SET
  )
