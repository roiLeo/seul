const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddedIndexes1639518117247 {
    name = 'AddedIndexes1639518117247'

    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX "IDX_86298c2379ad253a57cf5e42df" ON "unique_class" ("owner") `);
        await queryRunner.query(`CREATE INDEX "IDX_d649d6ee098cf67d6d5d964431" ON "unique_class" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_7c3c593cba0796b6f6557d3491" ON "unique_transfer" ("to") `);
        await queryRunner.query(`CREATE INDEX "IDX_d37ab4826ac0c2e64ea09ff81c" ON "unique_transfer" ("from") `);
        await queryRunner.query(`CREATE INDEX "IDX_1409924d7138ad7b436fe822f4" ON "unique_transfer" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_f049c71ea7aaa6a33cd2a0daa2" ON "unique_transfer" ("extrinisic_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e5496308be262a7275159b6047" ON "unique_transfer" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_cb4785ce0fc7c381fcd49de9c5" ON "unique_transfer" ("block_hash") `);
        await queryRunner.query(`CREATE INDEX "IDX_77c80b40c27df04c6f14794718" ON "unique_transfer" ("block_num") `);
        await queryRunner.query(`CREATE INDEX "IDX_7ceb0e3b8936e1deac76aaaa66" ON "unique_instance" ("inner_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e9a3d5197fd824c71b0a4ed5ad" ON "unique_instance" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_88b7476f4b8bbcec8defcaffbe" ON "account" ("wallet") `);
        await queryRunner.query(`CREATE INDEX "IDX_d83afa683094d63ab33f8d9a24" ON "account" ("balance") `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_d83afa683094d63ab33f8d9a24"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_88b7476f4b8bbcec8defcaffbe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9a3d5197fd824c71b0a4ed5ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7ceb0e3b8936e1deac76aaaa66"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_77c80b40c27df04c6f14794718"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb4785ce0fc7c381fcd49de9c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5496308be262a7275159b6047"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f049c71ea7aaa6a33cd2a0daa2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1409924d7138ad7b436fe822f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d37ab4826ac0c2e64ea09ff81c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7c3c593cba0796b6f6557d3491"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d649d6ee098cf67d6d5d964431"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86298c2379ad253a57cf5e42df"`);
    }
}
