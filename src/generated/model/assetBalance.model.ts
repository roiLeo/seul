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

  /**
   *  AccountId-AssetId
   */
  @Index_()
  @ManyToOne_(() => Account, {nullable: true})
  account!: Account | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  balance!: bigint

  @Index_()
  @ManyToOne_(() => Asset, {nullable: false})
  asset!: Asset
}
