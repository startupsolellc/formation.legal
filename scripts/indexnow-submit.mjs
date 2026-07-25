#!/usr/bin/env node
/**
 * IndexNow submission for formation.legal.
 *
 * Run AFTER a deploy has gone live, never before — IndexNow tells engines to
 * come fetch a URL right now, so the new content has to already be served.
 *
 * The script refuses to submit unless the key file is live and byte-identical
 * to the key, because a mismatched key file makes every submission a silent
 * 403. See docs/bing-indexnow-ops.md.
 *
 *   node scripts/indexnow-submit.mjs              # all URLs in the live sitemap
 *   node scripts/indexnow-submit.mjs /costs /faq  # only these paths
 */

const HOST = 'formation.legal';
const KEY = '4e3d092ea5871686fc071df6facb1efa';
const ORIGIN = `https://${HOST}`;
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const SITEMAP = `${ORIGIN}/sitemap-0.xml`;

async function assertKeyFileLive() {
  const res = await fetch(KEY_LOCATION, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) {
    throw new Error(`key file ${KEY_LOCATION} returned HTTP ${res.status} — deploy it first`);
  }
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('text/plain')) {
    throw new Error(`key file content-type is "${type}", expected text/plain`);
  }
  const body = (await res.text()).trim();
  if (body !== KEY) {
    throw new Error('key file body does not match the key — submissions would 403');
  }
  console.log(`key file verified: ${KEY_LOCATION}`);
}

async function urlsFromSitemap() {
  const res = await fetch(SITEMAP);
  if (!res.ok) throw new Error(`sitemap ${SITEMAP} returned HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  await assertKeyFileLive();

  const args = process.argv.slice(2);
  const urlList = args.length
    ? args.map((p) => (p.startsWith('http') ? p : `${ORIGIN}${p.startsWith('/') ? p : `/${p}`}`))
    : await urlsFromSitemap();

  if (!urlList.length) throw new Error('no URLs to submit');
  console.log(`submitting ${urlList.length} URL(s)`);

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });

  const body = await res.text();
  console.log(`HTTP ${res.status} ${body || '(empty body)'}`);

  // 200 accepted, 202 accepted pending key validation. Anything else is a real
  // failure: 403 = key mismatch, 422 = a URL is not on the declared host.
  if (res.status !== 200 && res.status !== 202) process.exit(1);

  console.log(
    '\nSubmitted is not done. Verify in 48-72h with GetUrlInfo.LastCrawledDate\n' +
      'and GetCrawlStats.InIndex — see docs/bing-indexnow-ops.md.',
  );
}

main().catch((err) => {
  console.error(`FAILED: ${err.message}`);
  process.exit(1);
});
