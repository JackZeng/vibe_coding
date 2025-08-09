import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { createFileRepoFactory } from '@launchpad/filedb';
import { App, Score } from '@launchpad/types';

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(rateLimit, { max: 600, timeWindow: '1 minute' });

  const repo = createFileRepoFactory();
  const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

  function requireAuth(req: any, _res: any, done: any) {
    const auth = req.headers['authorization'];
    if (!auth) return done(new Error('Unauthorized'));
    const token = (auth as string).replace(/^Bearer\s+/i, '');
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = { id: payload.sub };
      done();
    } catch {
      done(new Error('Unauthorized'));
    }
  }

  const AppCreateSchema = z.object({
    name: z.string().min(2).max(60),
    slug: z.string().regex(/^[a-z0-9-]{2,40}$/),
    description: z.string().max(1000)
  });

  app.post('/apps', { preHandler: requireAuth }, async (req, res) => {
    const body = AppCreateSchema.parse(req.body);
    const now = new Date().toISOString();
    const userId = (req as any).user?.id || 'anonymous';
    const a: App = {
      id: crypto.randomUUID(),
      ownerId: userId,
      name: body.name,
      slug: body.slug,
      description: body.description,
      status: 'public',
      createdAt: now,
      updatedAt: now
    };
    const saved = await repo.apps().create(a);
    return res.code(201).send(saved);
  });

  app.get('/apps/:id', async (req, res) => {
    const id = (req.params as any).id as string;
    const a = await repo.apps().get(id);
    if (!a) return res.code(404).send({ message: 'Not found' });
    res.send(a);
  });

  app.post('/apps/:id/deploy', { preHandler: requireAuth }, async (req, res) => {
    // MVP: accept and return 202
    res.code(202).send({ status: 'queued' });
  });

  app.post('/apps/:id/votes', { preHandler: requireAuth }, async (req, res) => {
    const schema = z.object({ value: z.number().int().refine((v) => v === 1 || v === -1) });
    const { value } = schema.parse(req.body);
    const appId = (req.params as any).id as string;
    const userId = (req as any).user?.id as string;
    await repo.votes().cast({ appId, userId, value: value as 1 | -1, ts: new Date() });
    res.send({ ok: true });
  });

  app.get('/leaderboard', async (req, res) => {
    const q = (req.query as any) || {};
    const window = (q.window as Score['window']) || 'week';
    const top = await repo.scores().top(window, 20);
    res.send(top);
  });

  const port = Number(process.env.PORT || 4000);
  app
    .listen({ port, host: '0.0.0.0' })
    .then(() => app.log.info(`API listening on http://localhost:${port}`))
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
}

main();