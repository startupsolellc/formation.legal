import type { StateFeesDataset } from '../types/state-fees';
import dataset from '../data/state-fees.json';

/**
 * Reads the US LLC fees dataset from the committed snapshot at
 * src/data/state-fees.json, synced from the local clone of
 * us-llc-fees-dataset at the commit pinned in data-pin.json
 * (`npm run sync-data`). The dataset repo is private, so the build never
 * touches the network.
 *
 * Throws on an empty snapshot: shipping the fee pages with no rows is worse
 * than a failed build.
 */
export async function fetchStateFees(): Promise<StateFeesDataset> {
  const data = dataset as unknown as StateFeesDataset;

  if (!data.states || Object.keys(data.states).length === 0) {
    throw new Error(
      'src/data/state-fees.json carries no states. Run `npm run sync-data` against the local us-llc-fees-dataset clone.',
    );
  }

  return data;
}
