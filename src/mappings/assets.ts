import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Asset, AssetStatus } from "../generated/model";
import { Assets, Balances } from "../types/index";
import { get, getOrCreate } from "./helpers/entity-utils";

export async function assetCreated({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {
  const [assetId, creator, owner] = new Assets.CreatedEvent(event).params;
  const asset = new Asset();

  asset.id = assetId.toString();
  asset.creator = creator.toString();
  asset.owner = owner.toString();
  asset.status = AssetStatus.ACTIVE;

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
