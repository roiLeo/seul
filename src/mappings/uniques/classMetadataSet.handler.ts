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

function getUniquesClassMetadataSetData(
  ctx: EventHandlerContext<Store>
): IUniquesClassMetaChange {
  const event = new events.UniquesClassMetadataSetEvent(ctx)
  if (event.isV1) {
    const [classId, data, isFrozen] = event.asV1
    return { classId, data, isFrozen }
  }
  if (event.isV700) {
    const { class: classId, data, isFrozen } = event.asV700
    return { classId, data, isFrozen }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { class: classId, data, isFrozen } = ctx._chain.decodeEvent(ctx.event)
  return { classId, data, isFrozen }
}

export const uniqueClassMetadataSet = async (
  ctx: EventHandlerContext<Store>
): Promise<void> =>
  processChangeClassMetadata(
    ctx,
    getUniquesClassMetadataSetData,
    EventType.METADATA_SET
  )
