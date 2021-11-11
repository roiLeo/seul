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
