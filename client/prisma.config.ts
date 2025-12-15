import { defineConfig } from '@prisma/cli';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasources: {
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL!,
      shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL!,
    }
  }
});
