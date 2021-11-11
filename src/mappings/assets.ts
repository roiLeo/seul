import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Asset, AssetStatus, Transfer, TransferType } from "../generated/model";
import { Assets } from "../types/index";
import { get } from "./helpers/entity-utils";

export async function assetCreated({
  store,
  event,
}: EventContext & StoreContext): Promise<void> {
  const [assetId, creator, owner] = new Assets.CreatedEvent(event).params;
  const asset = new Asset();

  asset.id = assetId.toString();
  asset.creator = creator.toString();
  asset.owner = owner.toString();
  asset.status = AssetStatus.ACTIVE;
  asset.totalSupply = 0n;

  await store.save(asset);
}

export async function assetMetadata({
  store,
  event,
}: EventContext & StoreContext): Promise<void> {
  const [asset_id, name, symbol, decimals, is_frozen] =
    new Assets.MetadataSetEvent(event).params;
  const asset = await get(store, Asset, asset_id.toString());
  if (!asset) {
    console.error("No asset found for id", asset_id.toString());
    process.exit(1);
  }

  asset.name = name.toString();
  asset.symbol = symbol.toString();
  asset.decimal = decimals.toNumber();
  asset.status = is_frozen.toJSON() ? AssetStatus.FREEZED : AssetStatus.ACTIVE;

  await store.save(asset);
}

export async function assetMetadataCleared({
  store,
  event,
}: EventContext & StoreContext): Promise<void> {
  const [asset_id] = new Assets.MetadataClearedEvent(event).params;
  const asset = await get(store, Asset, asset_id.toString());
  if (!asset) {
    console.error("No asset found for id", asset_id.toString());
    process.exit(1);
  }

  asset.name = null;
  asset.symbol = null;
  asset.decimal = null;
  // asset.status = is_frozen.toJSON() ? AssetStatus.FREEZED : AssetStatus.ACTIVE;

  await store.save(asset);
}

export async function assetIssued({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {
  const [asset_id, owner, issued] = new Assets.IssuedEvent(event).params;
  const asset = await get(store, Asset, asset_id.toString());
  if (!asset) {
    console.error("No asset found for id", asset_id.toString());
    process.exit(1);
  }

  asset.totalSupply = asset.totalSupply || 0n + issued.toBigInt();
  await store.save(asset);

  const transfer = new Transfer();
  transfer.amount = issued.toBigInt();
  transfer.asset = asset;
  transfer.blockHash = block.hash;
  transfer.blockNum = block.height;
  transfer.createdAt = new Date(block.timestamp);
  transfer.extrinisicId = extrinsic?.id;
  transfer.to = owner.toString();
  transfer.id = event.id;
  transfer.type = TransferType.MINT;
  transfer.success = true;
  await store.save(transfer);
}
