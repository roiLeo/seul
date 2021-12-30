import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_,Index as Index_} from "typeorm"
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

  @Index_()
  @Column_("text", {nullable: true})
  name!: string | undefined | null

  @Index_()
  @Column_("text", {nullable: true})
  symbol!: string | undefined | null

  @Index_()
  @Column_("text", {nullable: true})
  freezer!: string | undefined | null

  @Index_()
  @Column_("integer", {nullable: true})
  decimal!: number | undefined | null

  @Index_()
  @Column_("text", {nullable: false})
  owner!: string

  @Index_()
  @Column_("text", {nullable: true})
  admin!: string | undefined | null

  @Index_()
  @Column_("text", {nullable: true})
  issuer!: string | undefined | null

  @Index_()
  @Column_("text", {nullable: true})
  creator!: string | undefined | null


  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  minBalance!: bigint | undefined | null

  @Index_()
  @Column_("varchar", {length: 9, nullable: false})
  status!: AssetStatus

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  totalSupply!: bigint | undefined | null

  @OneToMany_(() => Transfer, e => e.asset)
  transfers!: Transfer[]

  @OneToMany_(() => AssetBalance, e => e.asset)
  assetBalances!: AssetBalance[]
}
