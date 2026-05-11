import { fetchStateFees } from '../src/lib/state-fees.ts';

async function testFetch() {
  console.log("Fetching data from public repo...");
  const data = await fetchStateFees();
  console.log(`Successfully fetched data for ${Object.keys(data.states).length} states.`);
  if (data.states.WY) {
    console.log("Wyoming Formation Fee:", data.states.WY.formation_fee);
  }
}

testFetch();
