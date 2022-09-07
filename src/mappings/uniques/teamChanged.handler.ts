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

export interface IUniquesTeamChanged {
  classId: number
  issuer: Uint8Array
  admin: Uint8Array
  freezer: Uint8Array
}

function getUniquesTeamChangedData(
  ctx: EventHandlerContext<Store>
): IUniquesTeamChanged {
  const event = new events.UniquesTeamChangedEvent(ctx)
  if (event.isV1) {
    const [classId, issuer, admin, freezer] = event.asV1
    return { classId, issuer, admin, freezer }
  }
  if (event.isV700) {
    const { class: classId, issuer, admin, freezer } = event.asV700
    return { classId, issuer, admin, freezer }
  }
  if (event.isV9230) {
    const { collection: classId, issuer, admin, freezer } = event.asV9230
    return { classId, issuer, admin, freezer }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    issuer,
    admin,
    freezer,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, issuer, admin, freezer }
}

export async function uniqueTeamChanged(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesTeamChangedData(ctx)
  const { classId, issuer, admin, freezer } = eventData

  const uniqueClass = await ctx.store.get(UniqueClass, classId.toString())
  assert(uniqueClass)
  uniqueClass.issuer = encodeId(issuer)
  uniqueClass.admin = encodeId(admin)
  uniqueClass.freezer = encodeId(freezer)
  await ctx.store.save(uniqueClass)

  const event = createEvent(ctx, {
    type: EventType.TEAM_CHANGE,
    uniqueClass,
  })
  await ctx.store.save(event)
}
