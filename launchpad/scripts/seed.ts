import { createFileRepoFactory } from '@launchpad/filedb';
import { App, User } from '@launchpad/types';

function iso(dt: Date) { return dt.toISOString(); }

async function main() {
  const repo = createFileRepoFactory();
  const now = new Date();
  const users: User[] = [
    { id: crypto.randomUUID(), email: 'alice@example.com', handle: 'alice', reputation: 1.5, status: 'active', createdAt: iso(now) },
    { id: crypto.randomUUID(), email: 'bob@example.com', handle: 'bob', reputation: 0.5, status: 'active', createdAt: iso(now) },
    { id: crypto.randomUUID(), email: 'mod@example.com', handle: 'mod', reputation: 1.0, status: 'active', createdAt: iso(now) }
  ];
  for (const u of users) await repo.users().create(u);

  const apps: App[] = Array.from({ length: 10 }).map((_, i) => {
    const created = new Date(Date.now() - (i * 36_000_000));
    return {
      id: crypto.randomUUID(),
      ownerId: users[i % users.length].id,
      name: `app-${i + 1}`,
      slug: `app-${i + 1}`,
      description: 'Demo app',
      status: 'public',
      createdAt: iso(created),
      updatedAt: iso(created)
    };
  });
  for (const a of apps) await repo.apps().create(a);

  // votes: random up/down in last 7 days
  for (const a of apps) {
    const votes = Math.floor(Math.random() * 50) + 10;
    for (let k = 0; k < votes; k++) {
      const ts = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000));
      const val = Math.random() < 0.8 ? 1 : -1;
      await repo.votes().cast({ appId: a.id, userId: users[k % users.length].id, value: val as 1 | -1, ts });
    }
  }
  console.log('Seeded users, apps, votes');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});