/* データベースのスキーマ */

import { pgTable, text, varchar, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').notNull(),
});

export const devices = pgTable(
    'devices',
    {
        id: uuid('id')
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),

        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

        name: text('name').notNull(),
        macAddress: varchar('mac_address', { length: 17 }).notNull(),
        description: text('description'),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => ({
        userMacAddressIdx: uniqueIndex('user_mac_address_idx').on(table.userId, table.macAddress),
    })
);
