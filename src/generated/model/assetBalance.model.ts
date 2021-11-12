import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "../marshal"
import {Account} from "./account.model"
import {Asset} from "./asset.model"

@Entity_()
export class AssetBalance {
  constructor(props?: Partial<AssetBalance>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Account, {nullable: false})
  wallet!: Account

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  balance!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  reserveBalance!: bigint

  @Index_()
  @ManyToOne_(() => Asset, {nullable: false})
  asset!: Asset
}
