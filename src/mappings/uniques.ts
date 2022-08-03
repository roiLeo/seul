import { EventHandlerContext } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import {
  Account,
  UniqueClass,
  UniqueInstance,
  AssetStatus,
  Transfer,
  TransferType,
  UniqueTransfer,
  Attribute,
} from "../model/generated";
import { EntityConstructor } from "../types";
import * as events from "../types/events";
import { encodeId, get, getOrCreate, isAdressSS58 } from "./helpers/entity-utils";

/**
 * Must get entity from database
 * @param {Store} store
 * @param {EntityConstructor<T>} entityConstructor
 * @param {string} entityId
 *
 * @returns {Promise<T>}
 */
export async function getOrDie<T extends { id: string }>(
  store: Store,
  entityConstructor: EntityConstructor<T>,
  entityId: string
): Promise<T> {
  const entity = await get(store, entityConstructor, entityId);
  if (!entity) {
    throw new Error(`No ${entityConstructor} found for id: ${entityId}`);
  }
  return entity;
}

/**
 * Get Account by its wallet from database
 * @param {Store} store
 * @param {string} wallet
 *
 * @returns {Promise<T>}
 */
export async function getAccountByWallet(
  store: Store,
  wallet: string
): Promise<Account> {
  const account = await getOrCreate(store, Account, wallet);
  if (!account.wallet) {
    account.wallet = wallet;
    account.balance = 0n;
  }
  await store.save(account);
  return account;
}

export function getInstanceGlobalId(
  classId: string,
  instanceInnerId: string
): string {
  return `${classId}-${instanceInnerId}`;
}

export async function uniqueClassCreated(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesCreatedEvent(ctx);
  if (event.isV1) {
    var [classId, creator, owner] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, creator, owner} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, creator, owner} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const uniqueClass = new UniqueClass();

  uniqueClass.id = classId.toString();
  uniqueClass.creator = creator.toString();
  uniqueClass.owner = owner.toString();
  uniqueClass.status = AssetStatus.ACTIVE;
  uniqueClass.attributes = [];

  await ctx.store.save(uniqueClass);

  const transfer = new UniqueTransfer();
  transfer.uniqueClass = uniqueClass;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.to = owner.toString();
  transfer.id = ctx.event.id;
  transfer.type = TransferType.CREATED;
  transfer.success = true;

  await ctx.store.save(transfer);
}

export async function uniqueClassFrozen(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesClassFrozenEvent(ctx);
  if (event.isV1) {
    var classId = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId} = event.asV700; 
  }
  else {
    throw event.constructor.name;
  }

  const class_ = await getOrCreate(ctx.store, UniqueClass, classId.toString());

  class_.status = AssetStatus.FREEZED;
  await ctx.store.save(class_);

  const transfer = new UniqueTransfer();
  transfer.uniqueClass = class_;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.id = ctx.event.id;
  transfer.type = TransferType.FREEZE;
  transfer.success = true;

  await ctx.store.save(transfer);
}

export async function uniqueClassThawed(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesClassThawedEvent(ctx);
  if (event.isV1) {
    var classId = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId} = event.asV700;
  }
  else {
    throw event.constructor.name;
  }
  const class_ = await getOrCreate(ctx.store, UniqueClass, classId.toString());

  class_.status = AssetStatus.ACTIVE;
  await ctx.store.save(class_);

  const transfer = new UniqueTransfer();
  transfer.uniqueClass = class_;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.id = ctx.event.id;
  transfer.type = TransferType.THAWED;
  transfer.success = true;

  await ctx.store.save(transfer);
}

export async function uniqueClassDestroyed(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesDestroyedEvent(ctx);
  if (event.isV1) {
    var classId = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId} = event.asV9230; 
  }
  else {
    throw event.constructor.name;
  }
  const class_ = await getOrCreate(ctx.store, UniqueClass, classId.toString());

  class_.status = AssetStatus.DESTROYED;
  await ctx.store.save(class_);

  const transfer = new UniqueTransfer();
  transfer.uniqueClass = class_;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.id = ctx.event.id;
  transfer.type = TransferType.DESTROYED;
  transfer.success = true;

  await ctx.store.save(transfer);
}

export async function uniqueInstanceIssued(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesIssuedEvent(ctx);
  if (event.isV1) {
    var [classId, instance, owner] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, instance, owner} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, item: instance, owner} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const uniqueClassPromise = getOrCreate(
    ctx.store,
    UniqueClass,
    classId.toString()
  );

  const ownerAccountPromise = getAccountByWallet(ctx.store, owner.toString());

  const [class_, ownerAccount] = await Promise.all([
    uniqueClassPromise,
    ownerAccountPromise,
  ]);

  class_.status = class_.status ?? AssetStatus.ACTIVE;
  await ctx.store.save(class_);

  const uniqueInstance = new UniqueInstance();
  const innerInstanceid = instance.toString();
  uniqueInstance.id = getInstanceGlobalId(class_.id, innerInstanceid);
  uniqueInstance.innerID = innerInstanceid;
  uniqueInstance.owner = ownerAccount;
  uniqueInstance.uniqueClass = class_;
  uniqueInstance.status = AssetStatus.ACTIVE;
  uniqueInstance.attributes = [];

  await ctx.store.save(uniqueInstance);

  const transfer = new UniqueTransfer();
  transfer.uniqueInstance = uniqueInstance;
  transfer.uniqueClass = class_;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.to = owner.toString();
  transfer.id = ctx.event.id;
  transfer.type = TransferType.MINT;
  transfer.success = true;

  await ctx.store.save(transfer);
}

export async function uniqueInstanceTransferred(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesTransferredEvent(ctx);
  if (event.isV1) {
    var [classId, instance, fromA, toA] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, instance, from: fromA, to: toA} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, item: instance, from: fromA, to: toA} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }

  let to = isAdressSS58(toA) ? encodeId(toA) : null;
  let from = isAdressSS58(fromA) ? encodeId(fromA) : null;
  if (!to || !from) return;
  const instanceProm = getOrDie(
    ctx.store,
    UniqueInstance,
    getInstanceGlobalId(classId.toString(), instance.toString())
  );
  const classProm = getOrDie(ctx.store, UniqueClass, classId.toString());
  const toAccProm = getAccountByWallet(ctx.store, to);
  const [inst, class_, toAcc] = await Promise.all([
    instanceProm,
    classProm,
    toAccProm,
  ]);

  inst.owner = toAcc;

  const transfer = new UniqueTransfer();
  transfer.uniqueInstance = inst;
  transfer.uniqueClass = class_;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.to = to;
  transfer.from = from;
  transfer.id = ctx.event.id;
  transfer.type = TransferType.REGULAR;
  transfer.success = true;
  await ctx.store.save(transfer);
}

export async function uniqueInstanceBurned(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesBurnedEvent(ctx);
  if (event.isV1) {
    var [classId, instance, ownerA] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, instance, owner: ownerA} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, item: instance, owner: ownerA} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const instanceProm = getOrDie(
    ctx.store,
    UniqueInstance,
    getInstanceGlobalId(classId.toString(), instance.toString())
  );
  const classProm = getOrDie(ctx.store, UniqueClass, classId.toString());
  const [inst, class_] = await Promise.all([instanceProm, classProm]);

  inst.status = AssetStatus.DESTROYED;
  await ctx.store.save(inst);
  let owner = isAdressSS58(ownerA) ? encodeId(ownerA) : null;
  const transfer = new UniqueTransfer();
  transfer.uniqueInstance = inst;
  transfer.uniqueClass = class_;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.from = owner;
  transfer.id = ctx.event.id;
  transfer.type = TransferType.BURN;
  transfer.success = true;
  await ctx.store.save(transfer);
}

export async function uniqueInstanceFrozen(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesFrozenEvent(ctx);
  if (event.isV1) {
    var [classId, instance] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, instance} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, item: instance} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const instanceProm = getOrDie(
    ctx.store,
    UniqueInstance,
    getInstanceGlobalId(classId.toString(), instance.toString())
  );
  const classProm = getOrDie(ctx.store, UniqueClass, classId.toString());
  const [inst, class_] = await Promise.all([instanceProm, classProm]);

  inst.status = AssetStatus.FREEZED;
  await ctx.store.save(inst);

  const transfer = new UniqueTransfer();

  transfer.uniqueInstance = inst;
  transfer.uniqueClass = class_;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.id = ctx.event.id;
  transfer.type = TransferType.FREEZE;
  transfer.success = true;
  await ctx.store.save(transfer);
}

export async function uniqueInstanceThawed(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesThawedEvent(ctx);
  if (event.isV1) {
    var [classId, instance] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, instance} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, item: instance} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const instanceProm = getOrDie(
    ctx.store,
    UniqueInstance,
    getInstanceGlobalId(classId.toString(), instance.toString())
  );
  const classProm = getOrDie(ctx.store, UniqueClass, classId.toString());
  const [inst, class_] = await Promise.all([instanceProm, classProm]);

  inst.status = AssetStatus.ACTIVE;
  await ctx.store.save(inst);

  const transfer = new UniqueTransfer();

  transfer.uniqueInstance = inst;
  transfer.uniqueClass = class_;
  transfer.blockHash = ctx.block.hash;
  transfer.blockNum = ctx.block.height;
  transfer.createdAt = new Date(ctx.block.timestamp);
  transfer.extrinisicId = ctx.event.extrinsic?.id;
  transfer.id = ctx.event.id;
  transfer.type = TransferType.THAWED;
  transfer.success = true;
  await ctx.store.save(transfer);
}

export async function uniquesClassMetadataSet(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesClassMetadataSetEvent(ctx);
  if (event.isV1) {
    var [classId, data, isFrozen] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, data, isFrozen} = event.asV700;
  }
  else {
    throw event.constructor.name;
  }
  const classProm = await getOrDie(ctx.store, UniqueClass, classId.toString());
  classProm.metadata = hexToString(data.toString());
  // classProm.status = isFrozen ? AssetStatus.FREEZED : AssetStatus.ACTIVE;
  await ctx.store.save(classProm);
}

export async function uniquesClassMetadataCleared(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesClassMetadataClearedEvent(ctx);
  if (event.isV1) {
    var classId = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId} = event.asV700;
  }
  else {
    throw event.constructor.name;
  }
  const classProm = await getOrDie(ctx.store, UniqueClass, classId.toString());
  classProm.metadata = null;
  await ctx.store.save(classProm);
}

export async function uniquesCollectionMetadataSet(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesCollectionMetadataSetEvent(ctx);
  if (event.isV9230) {
    var {collection, data, isFrozen} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const classProm = await getOrDie(ctx.store, UniqueClass, collection.toString());
  classProm.metadata = hexToString(data.toString());
  // classProm.status = isFrozen ? AssetStatus.FREEZED : AssetStatus.ACTIVE;
  await ctx.store.save(classProm);
}

export async function uniquesCollectionMetadataCleared(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesCollectionMetadataClearedEvent(ctx);
  if (event.isV9230) {
    var classId = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const classProm = await getOrDie(ctx.store, UniqueClass, classId.toString());
  classProm.metadata = null;
  await ctx.store.save(classProm);
}

export async function uniquesMetadataSet(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesMetadataSetEvent(ctx);
  if (event.isV1) {
    var [classId, instance, data, isFrozen] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, instance, data, isFrozen} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, item: instance, data, isFrozen} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const inst = await getOrDie(ctx.store, UniqueInstance, instance.toString());
  inst.metadata = hexToString(data.toString());
  await ctx.store.save(inst);
}

export async function uniquesMetadataCleared(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesMetadataClearedEvent(ctx);
  if (event.isV1) {
    var [classId, instance] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, instance} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, item: instance} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  const inst = await getOrDie(ctx.store, UniqueInstance, instance.toString());
  inst.metadata = null;
  await ctx.store.save(inst);   //Can just save instance? or need to add to class
}

export async function uniquesAttributeSet(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesAttributeSetEvent(ctx);
  if (event.isV1) {
    var [classId, instance, key, value] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, maybeInstance: instance, key, value} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, maybeItem: instance, key, value} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  let classOrInstance = instance ? await getOrDie(ctx.store, UniqueInstance, instance.toString()) :
                                   await getOrDie(ctx.store, UniqueClass, classId.toString());

  let attrIndex = classOrInstance.attributes.findIndex(attr => attr.key == key.toString());
  if (attrIndex !== -1) classOrInstance.attributes[attrIndex].value = value.toString();
  else classOrInstance.attributes.push( new Attribute({key: key.toString(), value: value.toString()}) );
  await ctx.store.save(classOrInstance);
}

export async function uniquesAttributeCleared(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesAttributeClearedEvent(ctx);
  if (event.isV1) {
    var [classId, instance, key] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, maybeInstance: instance, key} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, maybeItem: instance, key} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  let classOrInstance = instance ? await getOrDie(ctx.store, UniqueInstance, instance.toString()) :
                                   await getOrDie(ctx.store, UniqueClass, classId.toString());
  classOrInstance.attributes.filter(attr => attr.key != key.toString());
  await ctx.store.save(classOrInstance);
}

export async function uniquesTeamChanged(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesTeamChangedEvent(ctx);
  if (event.isV1) {
    var [classId, issuerA, adminA, freezerA] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, issuer: issuerA, admin: adminA, freezer: freezerA} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, issuer: issuerA, admin: adminA, freezer: freezerA} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  let instanceClass = await getOrDie(ctx.store, UniqueClass, classId.toString());
  let issuer = isAdressSS58(issuerA) ? encodeId(issuerA) : null;
  let admin = isAdressSS58(adminA) ? encodeId(adminA) : null;
  let freezer = isAdressSS58(freezerA) ? encodeId(freezerA) : null;

  instanceClass.issuer = issuer;
  instanceClass.admin = admin;
  instanceClass.freezer = freezer;
  await ctx.store.save(instanceClass);
}

export async function uniquesOwnerChanged(ctx: EventHandlerContext<Store>) {
  let event = new events.UniquesOwnerChangedEvent(ctx);
  if (event.isV1) {
    var [classId, newOwnerA] = event.asV1;
  }
  else if (event.isV700) {
    var {class: classId, newOwner: newOwnerA} = event.asV700;
  }
  else if (event.isV9230) {
    var {collection: classId, newOwner: newOwnerA} = event.asV9230;
  }
  else {
    throw event.constructor.name;
  }
  let newOwner = isAdressSS58(newOwnerA) ? encodeId(newOwnerA) : null;
  let instanceClass = await getOrDie(ctx.store, UniqueClass, classId.toString());
  instanceClass.owner = newOwner;
  await ctx.store.save(instanceClass);
}


function hexToString(text: string) {
	return text.startsWith('0x') ? Buffer.from(text.replace(/^0x/, ''), 'hex').toString() : text 
}