import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "../marshal"
import {Asset} from "./asset.model"
import {TransferType} from "./transferType"

@Entity_()
export class Transfer {
  constructor(props?: Partial<Transfer>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  /**
   * event id
   */
  @Column_("text", {nullable: false})
  amount!: string

  @Column_("text", {nullable: false})
  to!: string

  @Column_("text", {nullable: false})
  from!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  fee!: bigint | undefined | null

  @Index_()
  @ManyToOne_(() => Asset, {nullable: false})
  asset!: Asset

  @Column_("varchar", {length: 7, nullable: false})
  type!: TransferType

  @Column_("text", {nullable: true})
  extrinisicId!: string | undefined | null

  @Column_("bool", {nullable: false})
  success!: boolean

  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date

  @Column_("text", {nullable: false})
  blockHash!: string

  @Column_("integer", {nullable: false})
  blockNum!: number
}
