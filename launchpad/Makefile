.PHONY: init up seed test score-cron

init:
	corepack enable && corepack prepare pnpm@9.0.0 --activate || true
	pnpm i
	mkdir -p data/snapshots data/idx data/locks data/seq data/media data/archive
	cp -n .env.example .env || true

up:
	pnpm -r --parallel --filter ./apps/* run dev

seed:
	node --loader tsx ./scripts/seed.ts

score-cron:
	node --loader tsx ./apps/worker/src/recomputeScores.ts

test:
	pnpm -r run test