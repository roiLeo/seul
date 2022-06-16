import { EventHandlerContext, SubstrateProcessor } from "@subsquid/substrate-processor";
import { assetAccountFrozen, assetBalanceBurned, assetBalanceThawed, assetCreated, assetDestroyed, assetFrozen, assetMetadata, assetMetadataCleared, assetOwnerChanged, assetTeamChanged, assetThawed, assetTransfer, balancesTransfer, transferFee, uniqueClassCreated, uniqueClassDestroyed, uniqueClassFrozen, uniqueClassThawed, uniqueInstanceBurned, uniqueInstanceFrozen, uniqueInstanceIssued, uniqueInstanceThawed, uniqueInstanceTransferred } from "./mappings";
import { BalancesTransferEvent } from "./types/events";

const processor = new SubstrateProcessor('kusama_balances');
processor.setBatchSize(500);

processor.setDataSource({			//where to take the archive from ???
    archive: 'https://kusama.indexer.gc.subsquid.io/v4/graphql', 
    chain: 'wss://kusama-rpc.polkadot.io'
})

// processor.setBlockRange({from: , to: });
processor.addEventHandler('balances.Transfer', balancesTransfer);
processor.addEventHandler('balances.Deposit', transferFee);
processor.addEventHandler('assets.Created', assetCreated);
processor.addEventHandler('assets.AssetFrozen', assetFrozen);
processor.addEventHandler('assets.AssetThawed', assetThawed);
processor.addEventHandler('assets.Destroyed', assetDestroyed);
processor.addEventHandler('assets.OwnerChanged', assetOwnerChanged);
processor.addEventHandler('assets.TeamChanged', assetTeamChanged);
processor.addEventHandler('assets.MetadataSet', assetMetadata);
processor.addEventHandler('assets.MetadataCleared', assetMetadataCleared);
// processor.addEventHandler('assets.Issued', assetIssued);	///?????
processor.addEventHandler('assets.Transferred', assetTransfer);
processor.addEventHandler('assets.TransferredApproved', assetTransfer);
processor.addEventHandler('assets.Frozen', assetAccountFrozen);
processor.addEventHandler('assets.Burned', assetBalanceBurned);
processor.addEventHandler('assets.Thawed', assetBalanceThawed);
processor.addEventHandler('uniques.Created', uniqueClassCreated);
processor.addEventHandler('uniques.Issued', uniqueInstanceIssued);
processor.addEventHandler('uniques.Destroyed', uniqueClassDestroyed);
processor.addEventHandler('uniques.Transferred', uniqueInstanceTransferred);
processor.addEventHandler('uniques.Burned', uniqueInstanceBurned);
processor.addEventHandler('uniques.Frozen', uniqueInstanceFrozen);
processor.addEventHandler('uniques.Thawed', uniqueInstanceThawed);
processor.addEventHandler('uniques.ClassFrozen', uniqueClassFrozen);
processor.addEventHandler('uniques.ClassThawed', uniqueClassThawed);

processor.run();

interface TransferEvent {
	from: Uint8Array;
	to: Uint8Array;
	amount: bigint;
}

function getTransferEvent(ctx: EventHandlerContext): TransferEvent {
	const event = new BalancesTransferEvent(ctx);
	if (event.isV1020) {
	  const [from, to, amount] = event.asV1020;
	  return { from, to, amount };
	} else {
		// } else if (event.isV1050) {
	  const [from, to, amount] = event.asV1050;
	  return { from, to, amount };
	} /* else {
	  const { from, to, amount } = event.asV9130;
	} */
}












