const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class statemine1636630918291 {
    name = 'statemine1636630918291'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "transfer" ("id" character varying NOT NULL, "amount" numeric NOT NULL, "to" text NOT NULL, "from" text NOT NULL, "fee" numeric, "type" character varying(7) NOT NULL, "extrinisic_id" text, "success" boolean NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "block_hash" text NOT NULL, "block_num" integer NOT NULL, "asset_id" character varying, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e818cd083f48ed773afe017f7c" ON "transfer" ("asset_id") `);
        await queryRunner.query(`CREATE TABLE "historical_balance" ("id" character varying NOT NULL, "balance" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "account_id" character varying NOT NULL, CONSTRAINT "PK_74ac29ad0bdffb6d1281a1e17e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_383ff006e4b59db91d32cb891e" ON "historical_balance" ("account_id") `);
        await queryRunner.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "wallet" text NOT NULL, "balance" numeric NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asset_balance" ("id" character varying NOT NULL, "balance" numeric NOT NULL, "account_id" character varying NOT NULL, "asset_id" character varying NOT NULL, CONSTRAINT "PK_7ffc793d0d7d680c10e4741f173" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_55a3340913f4ffe21ffaa0e051" ON "asset_balance" ("account_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b3bbf183209c65d4306a85a06c" ON "asset_balance" ("asset_id") `);
        await queryRunner.query(`CREATE TABLE "asset" ("id" character varying NOT NULL, "name" text, "symbol" text, "freezer" text, "decimal" integer, "owner" text NOT NULL, "issuer" text, "creator" text, "min_balance" numeric, "status" character varying(9) NOT NULL, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_e818cd083f48ed773afe017f7c0" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historical_balance" ADD CONSTRAINT "FK_383ff006e4b59db91d32cb891e9" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset_balance" ADD CONSTRAINT "FK_55a3340913f4ffe21ffaa0e0510" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset_balance" ADD CONSTRAINT "FK_b3bbf183209c65d4306a85a06c4" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "asset_balance" DROP CONSTRAINT "FK_b3bbf183209c65d4306a85a06c4"`);
        await queryRunner.query(`ALTER TABLE "asset_balance" DROP CONSTRAINT "FK_55a3340913f4ffe21ffaa0e0510"`);
        await queryRunner.query(`ALTER TABLE "historical_balance" DROP CONSTRAINT "FK_383ff006e4b59db91d32cb891e9"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_e818cd083f48ed773afe017f7c0"`);
        await queryRunner.query(`DROP TABLE "asset"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3bbf183209c65d4306a85a06c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55a3340913f4ffe21ffaa0e051"`);
        await queryRunner.query(`DROP TABLE "asset_balance"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_383ff006e4b59db91d32cb891e"`);
        await queryRunner.query(`DROP TABLE "historical_balance"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e818cd083f48ed773afe017f7c"`);
        await queryRunner.query(`DROP TABLE "transfer"`);
    }
}
