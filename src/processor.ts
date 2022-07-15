import { SubstrateProcessor } from "@subsquid/substrate-processor";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import { assetAccountFrozen, assetBalanceBurned, assetBalanceThawed, assetCreated, assetDestroyed, assetFrozen, assetMetadataSet, assetMetadataCleared, assetOwnerChanged, assetTeamChanged, assetThawed, assetTransfer, balancesTransfer, transferFee, uniqueClassCreated, uniqueClassDestroyed, uniqueClassFrozen, uniqueClassThawed, uniqueInstanceBurned, uniqueInstanceFrozen, uniqueInstanceIssued, uniqueInstanceThawed, uniqueInstanceTransferred } from "./mappings";
import { getOrCreate } from "./mappings/helpers/entity-utils";
import { BalancesTransferEvent } from "./types/events";

// const processor = new substrateProcessor.SubstrateProcessor('statemine_balances');

const database = new TypeormDatabase();
const processor = new SubstrateProcessor(database)
/* processor.setDataSource({
	archive: 'https://kusama.archive.subsquid.io/graphql',
	chain: 'wss://statemine-rpc.polkadot.io'
}) */
processor.setBatchSize(500);

processor.setDataSource({
    archive: 'https://statemine.archive.subsquid.io/graphql', 
    chain: 'wss://statemine-rpc.polkadot.io'
})

// processor.setBlockRange({from: , to: });
processor.addEventHandler('Balances.Transfer', balancesTransfer);
processor.addEventHandler('Balances.Deposit', transferFee);
processor.addEventHandler('Assets.Created', assetCreated);
processor.addEventHandler('Assets.AssetFrozen', assetFrozen);
processor.addEventHandler('Assets.AssetThawed', assetThawed);
processor.addEventHandler('Assets.Destroyed', assetDestroyed);
processor.addEventHandler('Assets.OwnerChanged', assetOwnerChanged);
processor.addEventHandler('Assets.TeamChanged', assetTeamChanged);
processor.addEventHandler('Assets.MetadataSet', assetMetadataSet);
processor.addEventHandler('Assets.MetadataCleared', assetMetadataCleared);
// processor.addEventHandler('assets.Issued', assetIssued);	///?????
processor.addEventHandler('Assets.Transferred', assetTransfer);
processor.addEventHandler('Assets.TransferredApproved', assetTransfer);
processor.addEventHandler('Assets.Frozen', assetAccountFrozen);
processor.addEventHandler('Assets.Burned', assetBalanceBurned);
processor.addEventHandler('Assets.Thawed', assetBalanceThawed);
processor.addEventHandler('Uniques.Created', uniqueClassCreated);
processor.addEventHandler('Uniques.Issued', uniqueInstanceIssued);
processor.addEventHandler('Uniques.Destroyed', uniqueClassDestroyed);
processor.addEventHandler('Uniques.Transferred', uniqueInstanceTransferred);
processor.addEventHandler('Uniques.Burned', uniqueInstanceBurned);
processor.addEventHandler('Uniques.Frozen', uniqueInstanceFrozen);
processor.addEventHandler('Uniques.Thawed', uniqueInstanceThawed);
processor.addEventHandler('Uniques.ClassFrozen', uniqueClassFrozen);
processor.addEventHandler('Uniques.ClassThawed', uniqueClassThawed);

processor.run();

interface TransferEvent {
	from: Uint8Array;
	to: Uint8Array;
	amount: bigint;
}

/* npx squid-substrate-metadata-explorer \
--chain wss://statemine-rpc.polkadot.io \
--archive https://statemine.archive.subsquid.io/graphql \
--out statemineVersions.jsonl */





