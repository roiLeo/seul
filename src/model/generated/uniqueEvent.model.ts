import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {UniqueClass} from "./uniqueClass.model"
import {UniqueInstance} from "./uniqueInstance.model"
import {EventType} from "./_eventType"

@Entity_()
export class UniqueEvent {
  constructor(props?: Partial<UniqueEvent>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("text", {nullable: true})
  from!: string | undefined | null

  @Index_()
  @Column_("text", {nullable: true})
  to!: string | undefined | null

  @Index_()
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  price!: bigint | undefined | null

  @Index_()
  @ManyToOne_(() => UniqueClass, {nullable: true})
  uniqueClass!: UniqueClass | undefined | null

  @Index_()
  @ManyToOne_(() => UniqueInstance, {nullable: true})
  uniqueInstance!: UniqueInstance | undefined | null

  @Index_()
  @Column_("varchar", {length: 15, nullable: false})
  type!: EventType

  @Index_()
  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Column_("text", {nullable: false})
  blockHash!: string

  @Index_()
  @Column_("int4", {nullable: false})
  blockNum!: number
}
