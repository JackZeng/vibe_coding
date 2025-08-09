import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import {
  App,
  AppsRepo,
  RepoFactory,
  Score,
  ScoresRepo,
  UsersRepo,
  User,
  VotesRepo
} from '@launchpad/types';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function appendJsonl(collection: string, record: any): Promise<void> {
  const filePath = path.join(DATA_DIR, `${collection}.jsonl`);
  await ensureDir(DATA_DIR);
  const line = JSON.stringify(record) + '\n';
  const fh = await fs.open(filePath, 'a');
  try {
    await fh.appendFile(line);
    await fh.sync();
  } finally {
    await fh.close();
  }
}

async function readSnapshot<T>(name: string, fallback: T): Promise<T> {
  const p = path.join(DATA_DIR, 'snapshots', `${name}.json`);
  try {
    const buf = await fs.readFile(p, 'utf8');
    return JSON.parse(buf) as T;
  } catch {
    return fallback;
  }
}

async function writeSnapshot<T>(name: string, data: T): Promise<void> {
  const dir = path.join(DATA_DIR, 'snapshots');
  await ensureDir(dir);
  const tmp = path.join(dir, `${name}.json.tmp`);
  const dst = path.join(dir, `${name}.json`);
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, dst);
}

function nowIso(): string {
  return new Date().toISOString();
}

export class FileUsersRepo implements UsersRepo {
  private cache: Map<string, User> = new Map();
  private emailToId: Map<string, string> = new Map();
  private ready: Promise<void>;

  constructor() {
    this.ready = this.load();
  }

  private async load() {
    const snap = await readSnapshot<Record<string, User>>('users.snapshot', {});
    for (const user of Object.values(snap)) {
      this.cache.set(user.id, user);
      this.emailToId.set(user.email, user.id);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    await this.ready;
    const id = this.emailToId.get(email);
    return id ? this.cache.get(id) ?? null : null;
  }

  async getById(id: string): Promise<User | null> {
    await this.ready;
    return this.cache.get(id) ?? null;
  }

  async create(u: User): Promise<User> {
    await this.ready;
    const record = { _id: u.id, _ts: nowIso(), _op: 'insert', data: u };
    await appendJsonl('users', record);
    this.cache.set(u.id, u);
    this.emailToId.set(u.email, u.id);
    await writeSnapshot('users.snapshot', Object.fromEntries([...this.cache].map(([id, user]) => [id, user])));
    return u;
  }
}

export class FileAppsRepo implements AppsRepo {
  private apps: Map<string, App> = new Map();
  private slugToId: Map<string, string> = new Map();
  private orderedByCreated: string[] = [];
  private ready: Promise<void>;

  constructor() {
    this.ready = this.load();
  }

  private async load() {
    const snap = await readSnapshot<Record<string, App>>('apps.snapshot', {});
    const entries = Object.values(snap).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const a of entries) {
      this.apps.set(a.id, a);
      this.slugToId.set(a.slug, a.id);
    }
    this.orderedByCreated = entries.map((a) => a.id);
  }

  async create(a: App): Promise<App> {
    await this.ready;
    const rec = { _id: a.id, _ts: nowIso(), _op: 'insert', data: a };
    await appendJsonl('apps', rec);
    this.apps.set(a.id, a);
    this.slugToId.set(a.slug, a.id);
    this.orderedByCreated.push(a.id);
    await writeSnapshot('apps.snapshot', Object.fromEntries([...this.apps]));
    return a;
  }

  async update(a: Partial<App> & { id: string }): Promise<App> {
    await this.ready;
    const curr = this.apps.get(a.id);
    if (!curr) throw new Error('app not found');
    const next: App = { ...curr, ...a, updatedAt: new Date().toISOString() } as App;
    const rec = { _id: next.id, _ts: nowIso(), _op: 'update', data: next };
    await appendJsonl('apps', rec);
    this.apps.set(next.id, next);
    await writeSnapshot('apps.snapshot', Object.fromEntries([...this.apps]));
    return next;
  }

  async get(id: string): Promise<App | null> {
    await this.ready;
    return this.apps.get(id) ?? null;
  }

  async getBySlug(slug: string): Promise<App | null> {
    await this.ready;
    const id = this.slugToId.get(slug);
    return id ? this.apps.get(id) ?? null : null;
  }

  async list(opts: { tag?: string; order?: 'created' | 'score'; limit: number; offset: number }): Promise<App[]> {
    await this.ready;
    const ids = this.orderedByCreated.slice(opts.offset, opts.offset + opts.limit);
    return ids.map((id) => this.apps.get(id)!).filter(Boolean);
  }
}

export class FileVotesRepo implements VotesRepo {
  async cast(v: { appId: string; userId: string; value: 1 | -1; ts: Date }): Promise<{ accepted: boolean; reason?: string }> {
    const id = nanoid();
    const record = {
      _id: id,
      _ts: v.ts.toISOString(),
      _op: 'insert',
      data: { id, appId: v.appId, userId: v.userId, value: v.value, createdAt: v.ts.toISOString() }
    };
    // Idempotency by day can be added later; minimal now
    await appendJsonl('votes', record);
    return { accepted: true };
  }

  async tally(appId: string, window: 'week' | 'month' | 'year' | 'all'): Promise<{ up: number; down: number }> {
    // naive scan votes.jsonl until index implemented
    const filePath = path.join(DATA_DIR, 'votes.jsonl');
    let up = 0,
      down = 0;
    let since = 0;
    const now = Date.now();
    if (window !== 'all') {
      const days = window === 'week' ? 7 : window === 'month' ? 30 : 365;
      since = now - days * 24 * 3600 * 1000;
    }
    try {
      const content = await fs.readFile(filePath, 'utf8');
      for (const line of content.split('\n')) {
        if (!line.trim()) continue;
        const rec = JSON.parse(line);
        const d = rec.data as { appId: string; value: number; createdAt: string };
        if (d.appId !== appId) continue;
        const ts = new Date(d.createdAt).getTime();
        if (window !== 'all' && ts < since) continue;
        if (d.value === 1) up++;
        else if (d.value === -1) down++;
      }
    } catch {
      // ignore if no file
    }
    return { up, down };
  }
}

export class FileScoresRepo implements ScoresRepo {
  private async loadScores(window: Score['window']): Promise<Record<string, Score>> {
    const name = `scores_${window}.snapshot`;
    return await readSnapshot<Record<string, Score>>(name, {});
  }

  private async saveScores(window: Score['window'], map: Record<string, Score>): Promise<void> {
    const name = `scores_${window}.snapshot`;
    await writeSnapshot(name, map);
  }

  async upsert(s: Score): Promise<void> {
    const map = await this.loadScores(s.window);
    map[s.appId] = s;
    await appendJsonl(`scores_${s.window}`, { _id: s.id, _ts: nowIso(), _op: 'upsert', data: s });
    await this.saveScores(s.window, map);
  }

  async top(window: 'week' | 'month' | 'year' | 'all', limit: number, _tag?: string | undefined): Promise<Score[]> {
    const map = await this.loadScores(window);
    return Object.values(map)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }
}

export function createFileRepoFactory(): RepoFactory {
  return {
    users: () => new FileUsersRepo(),
    apps: () => new FileAppsRepo(),
    votes: () => new FileVotesRepo(),
    scores: () => new FileScoresRepo()
  };
}