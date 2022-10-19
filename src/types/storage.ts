import assert from 'assert'
import {Block, Chain, ChainContext, BlockContext, Result} from './support'
import * as v1 from './v1'
import * as v9230 from './v9230'

export class UniquesClassStorage {
  private readonly _chain: Chain
  private readonly blockHash: string

  constructor(ctx: BlockContext)
  constructor(ctx: ChainContext, block: Block)
  constructor(ctx: BlockContext, block?: Block) {
    block = block || ctx.block
    this.blockHash = block.hash
    this._chain = ctx._chain
  }

  /**
   *  Details of an asset class.
   */
  get isV1() {
    return this._chain.getStorageItemTypeHash('Uniques', 'Class') === '1e1179cfd57216efc5c1637c0aa0a4ae6eff2649845c501f9d404542ba254ed4'
  }

  /**
   *  Details of an asset class.
   */
  async getAsV1(key: number): Promise<v1.ClassDetails | undefined> {
    assert(this.isV1)
    return this._chain.getStorage(this.blockHash, 'Uniques', 'Class', key)
  }

  async getManyAsV1(keys: number[]): Promise<(v1.ClassDetails | undefined)[]> {
    assert(this.isV1)
    return this._chain.queryStorage(this.blockHash, 'Uniques', 'Class', keys.map(k => [k]))
  }

  async getAllAsV1(): Promise<(v1.ClassDetails)[]> {
    assert(this.isV1)
    return this._chain.queryStorage(this.blockHash, 'Uniques', 'Class')
  }

  /**
   *  Details of a collection.
   */
  get isV9230() {
    return this._chain.getStorageItemTypeHash('Uniques', 'Class') === '7d8bf59996f2d3901df3ccd9b19fb3c13d435bb2d2b67820e7ee13c594f1cb1b'
  }

  /**
   *  Details of a collection.
   */
  async getAsV9230(key: number): Promise<v9230.CollectionDetails | undefined> {
    assert(this.isV9230)
    return this._chain.getStorage(this.blockHash, 'Uniques', 'Class', key)
  }

  async getManyAsV9230(keys: number[]): Promise<(v9230.CollectionDetails | undefined)[]> {
    assert(this.isV9230)
    return this._chain.queryStorage(this.blockHash, 'Uniques', 'Class', keys.map(k => [k]))
  }

  async getAllAsV9230(): Promise<(v9230.CollectionDetails)[]> {
    assert(this.isV9230)
    return this._chain.queryStorage(this.blockHash, 'Uniques', 'Class')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this._chain.getStorageItemTypeHash('Uniques', 'Class') != null
  }
}

export class UniquesInstanceMetadataOfStorage {
  private readonly _chain: Chain
  private readonly blockHash: string

  constructor(ctx: BlockContext)
  constructor(ctx: ChainContext, block: Block)
  constructor(ctx: BlockContext, block?: Block) {
    block = block || ctx.block
    this.blockHash = block.hash
    this._chain = ctx._chain
  }

  /**
   *  Metadata of an asset instance.
   */
  get isV1() {
    return this._chain.getStorageItemTypeHash('Uniques', 'InstanceMetadataOf') === '36776a13816cab10cc18dd56fcac5cb2817f77f7b82bf520cc24f74ac55e6f6d'
  }

  /**
   *  Metadata of an asset instance.
   */
  async getAsV1(key1: number, key2: number): Promise<v1.InstanceMetadata | undefined> {
    assert(this.isV1)
    return this._chain.getStorage(this.blockHash, 'Uniques', 'InstanceMetadataOf', key1, key2)
  }

  async getManyAsV1(keys: [number, number][]): Promise<(v1.InstanceMetadata | undefined)[]> {
    assert(this.isV1)
    return this._chain.queryStorage(this.blockHash, 'Uniques', 'InstanceMetadataOf', keys)
  }

  async getAllAsV1(): Promise<(v1.InstanceMetadata)[]> {
    assert(this.isV1)
    return this._chain.queryStorage(this.blockHash, 'Uniques', 'InstanceMetadataOf')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this._chain.getStorageItemTypeHash('Uniques', 'InstanceMetadataOf') != null
  }
}
