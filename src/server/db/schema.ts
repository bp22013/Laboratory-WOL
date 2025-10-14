/* データベースのスキーマ */

import { pgTable, serial, text, varchar, integer, uniqueIndex } from 'drizzle-orm/pg-core';

export const wolQueue = pgTable('wol_queue', {
    id: serial('id').primaryKey(),
    macAddress: varchar('mac_address', { length: 17 }).notNull(),
    createdAt: integer('created_at').notNull(),
});

export const devices = pgTable(
    'devices',
    {
        id: serial('id').primaryKey(),
        name: text('name').notNull(),
        macAddress: varchar('mac_address', { length: 17 }).notNull(),
        createdAt: integer('created_at').notNull(),
    },
    (table) => {
        return {
            macAddressIdx: uniqueIndex('mac_address_idx').on(table.macAddress),
        };
    }
);
