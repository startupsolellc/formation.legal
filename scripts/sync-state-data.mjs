/**
 * sync-state-data.mjs
 * ---
 * Refresh the committed dataset snapshot from the LOCAL CLONE of
 * us-llc-fees-dataset, at the commit pinned in data-pin.json. Local-only:
 * CI and Cloudflare builds never run this — they build from the file
 * committed at src/data/state-fees.json. Nothing here touches the network,
 * so the dataset repo being private changes nothing.
 *
 *   states.json  ->  src/data/state-fees.json
 *
 * Reads go through `git show <commit>:states.json`, so the clone's working
 * tree can be dirty; only the pinned commit matters. To take new upstream
 * data: `git -C <localClone> fetch`, bump `commit` in data-pin.json, run
 * `npm run sync-data`, review the diff, commit.
 *
 * Never hand-edit src/data/state-fees.json — this script overwrites it.
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'src', 'data');
const OUT_PATH = join(OUT_DIR, 'state-fees.json');

const pin = JSON.parse(readFileSync(join(ROOT, 'data-pin.json'), 'utf-8'));
const CLONE = pin.localClone.replace(/^~/, homedir());
const SHA = pin.commit;
const SOURCE_PATH = 'states.json';

function main() {
  // The clone only exists on a maintainer machine. When it is missing, keep
  // the committed snapshot instead of overwriting it with nothing: a silent
  // partial sync would ship an empty fee table.
  if (!existsSync(CLONE)) {
    if (existsSync(OUT_PATH)) {
      console.log(`[sync-state-data] Local clone not found at ${CLONE}; keeping the committed snapshot.`);
      return;
    }
    console.error(`[sync-state-data] Local clone not found at ${CLONE} and no committed snapshot exists.`);
    process.exit(1);
  }

  try {
    execFileSync('git', ['-C', CLONE, 'cat-file', '-e', `${SHA}^{commit}`]);
  } catch {
    console.error(
      `[sync-state-data] Cannot read commit ${SHA.slice(0, 7)} in ${CLONE}.\n` +
        `Is the clone up to date? Run: git -C "${CLONE}" fetch`,
    );
    process.exit(1);
  }

  const raw = execFileSync('git', ['-C', CLONE, 'show', `${SHA}:${SOURCE_PATH}`], {
    encoding: 'utf-8',
    maxBuffer: 16 * 1024 * 1024,
  });

  // Trailing commas creep in through hand-editing upstream; strip them so a
  // stray one is a formatting detail here rather than a broken build.
  const data = JSON.parse(raw.replace(/,\s*([\]}])/g, '$1'));

  const count = Object.keys(data.states || {}).length;
  if (count === 0) {
    console.error('[sync-state-data] Aborting: the pinned states.json carries no states.');
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  writeFileSync(OUT_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  console.log(
    `[sync-state-data] states ✅ synced: ${count} (us-llc-fees-dataset @ ${SHA.slice(0, 7)}, last_updated ${data.last_updated})`,
  );
  console.log('[sync-state-data] Done. Review the diff in src/data/state-fees.json and commit it.');
}

main();
