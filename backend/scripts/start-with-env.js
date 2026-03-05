#!/usr/bin/env node
/**
 * Garante DATABASE_URL antes de rodar Prisma (migrate/deploy) e o servidor.
 * No Railway, a URL interna (postgres.railway.internal) às vezes falha com P1000;
 * usar a URL pública (DATABASE_PUBLIC_URL) costuma resolver.
 */
const url =
  process.env.DATABASE_PUBLIC_URL ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  '';
if (url) process.env.DATABASE_URL = url;

const { execSync } = require('child_process');
const commands = ['prisma generate', 'prisma migrate deploy', 'node dist/server.js'];
for (const cmd of commands) {
  execSync(cmd, { stdio: 'inherit', env: process.env });
}
