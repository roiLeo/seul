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

function getUniquesClassMetadataClearedData(
  ctx: EventHandlerContext<Store>
): IUniquesClassMetaChange {
  const event = new events.UniquesClassMetadataClearedEvent(ctx)
  if (event.isV1) {
    const classId = event.asV1
    return { classId }
  }
  if (event.isV700) {
    const { class: classId } = event.asV700
    return { classId }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { class: classId } = ctx._chain.decodeEvent(ctx.event)
  return { classId }
}

export const uniqueClassMetadataCleared = async (
  ctx: EventHandlerContext<Store>
): Promise<void> =>
  processChangeClassMetadata(
    ctx,
    getUniquesClassMetadataClearedData,
    EventType.METADATA_CLEAR
  )
