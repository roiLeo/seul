import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {UniqueEvent} from "./uniqueEvent.model"
import {Account} from "./account.model"
import {Direction} from "./_direction"

@Entity_()
export class AccountTransfer {
    constructor(props?: Partial<AccountTransfer>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => UniqueEvent, {nullable: true})
    event!: UniqueEvent

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    account!: Account

    @Column_("varchar", {length: 4, nullable: false})
    direction!: Direction
}
