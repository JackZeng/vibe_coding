import { createFileRepoFactory } from '@launchpad/filedb';
import { Score } from '@launchpad/types';

const G = parseFloat(process.env.HN_G ?? '1.6');

function wilsonLower(up: number, down: number, z = 1.96) {
  const n = Math.max(up + down, 1);
  const p = up / n;
  const z2 = z * z;
  return (p + z2 / (2 * n) - z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)) / (1 + z2 / n);
}

async function recompute(window: Score['window']) {
  const repo = createFileRepoFactory();
  // list apps via repo.apps() - no direct list API for all, use snapshot through a hack: list first 1000 by created
  const apps = await repo.apps().list({ limit: 1000, offset: 0, order: 'created' });
  for (const app of apps) {
    const { up, down } = await repo.votes().tally(app.id, window);
    const hours = Math.max((Date.now() - new Date(app.createdAt).getTime()) / 3600000, 0);
    const hot = (up - down) / Math.pow(hours + 2, G);
    const quality = Math.max(wilsonLower(up, down), 0.05);
    const total = hot * quality;
    await repo.scores().upsert({
      id: crypto.randomUUID(),
      appId: app.id,
      window,
      up,
      down,
      wilsonLower: quality,
      hotScore: hot,
      totalScore: total,
      updatedAt: new Date().toISOString()
    });
  }
}

async function main() {
  const windows: Score['window'][] = ['week', 'month', 'year', 'all'];
  for (const w of windows) {
    await recompute(w);
  }
  console.log('Recompute done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});