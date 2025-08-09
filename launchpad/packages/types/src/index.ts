export type ISODateString = string;

export interface User {
  id: string;
  email: string;
  handle: string;
  reputation: number;
  status: 'active' | 'banned' | 'pending' | string;
  createdAt: ISODateString;
}

export interface App {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  readme?: string;
  iconUrl?: string;
  status: 'public' | 'unlisted' | 'private' | string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Deployment {
  id: string;
  appId: string;
  version: string;
  imageRef: string;
  status: string;
  health?: string;
  createdAt: ISODateString;
  rolledBackFrom?: string;
}

export interface Vote {
  id: string;
  appId: string;
  userId: string;
  value: 1 | -1;
  ipHash?: string;
  deviceId?: string;
  createdAt: ISODateString;
}

export interface Score {
  id: string;
  appId: string;
  window: 'week' | 'month' | 'year' | 'all';
  up: number;
  down: number;
  wilsonLower: number;
  hotScore: number;
  totalScore: number;
  updatedAt: ISODateString;
}

export interface Comment {
  id: string;
  appId: string;
  userId: string;
  bodyMd: string;
  status: string;
  createdAt: ISODateString;
}

export interface UsersRepo {
  findByEmail(email: string): Promise<User | null>;
  create(u: User): Promise<User>;
  getById(id: string): Promise<User | null>;
}

export interface AppsRepo {
  create(a: App): Promise<App>;
  update(a: Partial<App> & { id: string }): Promise<App>;
  get(id: string): Promise<App | null>;
  getBySlug(slug: string): Promise<App | null>;
  list(opts: {
    tag?: string;
    order?: 'created' | 'score';
    limit: number;
    offset: number;
  }): Promise<App[]>;
}

export interface VotesRepo {
  cast(v: { appId: string; userId: string; value: 1 | -1; ts: Date }): Promise<{ accepted: boolean; reason?: string }>;
  tally(appId: string, window: 'week' | 'month' | 'year' | 'all'): Promise<{ up: number; down: number }>;
}

export interface ScoresRepo {
  upsert(s: Score): Promise<void>;
  top(window: 'week' | 'month' | 'year' | 'all', limit: number, tag?: string): Promise<Score[]>;
}

export interface RepoFactory {
  users(): UsersRepo;
  apps(): AppsRepo;
  votes(): VotesRepo;
  scores(): ScoresRepo;
}