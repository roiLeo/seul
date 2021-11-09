import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "../marshal"
import {AssetStatus} from "./assetStatus"
import {Transfer} from "./transfer.model"
import {AssetBalance} from "./assetBalance.model"

@Entity_()
export class Asset {
  constructor(props?: Partial<Asset>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: true})
  name!: string | undefined | null

  @Column_("text", {nullable: true})
  symbol!: string | undefined | null

  @Column_("integer", {nullable: true})
  decimal!: number | undefined | null

  @Column_("text", {nullable: false})
  admin!: string

  @Column_("text", {nullable: true})
  issuer!: string | undefined | null

  @Column_("text", {nullable: true})
  freezer!: string | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  minBalance!: bigint

  @Column_("varchar", {length: 9, nullable: false})
  status!: AssetStatus

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  totalSupply!: bigint

  /**
   * Total supply of asset in statemine
   */
  @OneToMany_(() => Transfer, e => e.asset)
  transfers!: Transfer[]

  @OneToMany_(() => AssetBalance, e => e.asset)
  balances!: AssetBalance[]
}
