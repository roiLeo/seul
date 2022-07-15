import type {Result} from './support'

export type AssetId = number

export type AccountId = Uint8Array

export type TAssetBalance = bigint

export type Balance = bigint

export type ClassId = number

export type InstanceId = number

export type LookupSource = LookupSource_Id | LookupSource_Index | LookupSource_Raw | LookupSource_Address32 | LookupSource_Address20

export interface LookupSource_Id {
  __kind: 'Id'
  value: AccountId
}

export interface LookupSource_Index {
  __kind: 'Index'
  value: number
}

export interface LookupSource_Raw {
  __kind: 'Raw'
  value: Uint8Array
}

export interface LookupSource_Address32 {
  __kind: 'Address32'
  value: H256
}

export interface LookupSource_Address20 {
  __kind: 'Address20'
  value: H160
}

export type H256 = Uint8Array

export type H160 = Uint8Array
