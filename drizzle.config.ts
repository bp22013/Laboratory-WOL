import { config } from 'dotenv';
import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });
dotenv.config();

export default defineConfig({
    schema: './src/server/db/schema.ts',
    out: './src/server/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
