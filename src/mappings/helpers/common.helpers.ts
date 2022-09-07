import { Store } from '@subsquid/typeorm-store/lib/store'
import * as ss58 from '@subsquid/ss58'
import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Account, UniqueEvent } from '../../model'

export async function getOrCreateAccount(
  store: Store,
  id: string
): Promise<Account> {
  let account = await store.get(Account, id)

  if (!account) {
    account = new Account({ id })
    await store.save(account)
  }
  return account
}


export function getItemId(classNativeId: number, nativeId: number): string {
  return `${classNativeId}-${nativeId}`
}

export function encodeId(id: Uint8Array): string {
  return ss58.codec('kusama').encode(id)
}

export function createEvent(
  ctx: EventHandlerContext<Store>,
  addProps: Partial<UniqueEvent>
): UniqueEvent {
  return new UniqueEvent({
    id: ctx.event.id,
    blockHash: ctx.block.hash,
    blockNum: ctx.block.height,
    timestamp: new Date(ctx.block.timestamp),
    ...addProps,
  })
}

// export function isAdressSS58(address: Uint8Array) {
//   switch (address.length) {
//     case 1:
//     case 2:
//     case 4:
//     case 8:
//     case 32:
//     case 33:
//       return true
//     default:
//       return false
//   }
// }

/* export async function findInstanceInStorage(ctx: EventHandlerContext<Store>, classId: number, instId: number) {
  let inst = new storage.UniquesInstanceMetadataOfStorage(ctx);
  let instStorage: InstanceMetadata | undefined;
  if (inst.isV1) {
    instStorage = await inst.getAsV1(classId, instId);
  }
  const class_ = await getOrCreate(ctx.store, UniqueClass, classId.toString());
  if (!instStorage || !class_) return false
  var instProm = new UniqueInstance();
  instProm.id = classId.toString();
  instProm.innerID = instId.toString();
  let owner = new storage.UniquesAccountStorage(ctx);
  if (owner.isV1) {
    instProm.owner = await owner.getAsV1();
  }
  instProm.issuer = isAdressSS58(classStorage.issuer) ? encodeId(classStorage.issuer) : null;
  instProm.admin = isAdressSS58(classStorage.admin) ? encodeId(classStorage.admin) : null;
  instProm.freezer = isAdressSS58(classStorage.freezer) ? encodeId(classStorage.freezer) : null;
  instProm.totalDeposit = classStorage.totalDeposit;
  instProm.status = AssetStatus.ACTIVE;
  return classProm;
} */
