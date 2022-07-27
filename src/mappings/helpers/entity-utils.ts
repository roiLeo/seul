import { Store } from "@subsquid/typeorm-store/lib/store";
import { EntityConstructor, WhereCondition } from "../../types";
import * as ss58 from '@subsquid/ss58'
// import config from "../../config";

export async function getOrCreate<T extends { id: string }>(
  store: Store,
  entityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {
  let e = await store.get(entityConstructor, id);

  if (e == null) {
    e = new entityConstructor();
    e.id = id;
  }

  return e;
}
export async function get<T extends { id: string }>(
  store: Store,
  entityConstructor: EntityConstructor<T>,
  id: string,
): Promise<T | undefined> {
  const e = await store.get(entityConstructor, id);

  return e;
}

export function encodeId(id: Uint8Array) {
  return ss58.codec('polkadot'/* config.prefix */).encode(id)
}

export function isAdressSS58(address: Uint8Array) {
  switch (address.length) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 32:
      case 33:
          return true
      default:
          return false
  }
}