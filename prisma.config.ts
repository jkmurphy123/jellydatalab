// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Where your schema is:
  schema: 'prisma/schema.prisma',

  // Optional: migrations folder (Prisma will default to prisma/migrations anyway)
  migrations: {
    path: 'prisma/migrations',
  },

  // Tell Prisma where to get the DB URL
  datasource: {
    url: env('DATABASE_URL'),
  },
});
