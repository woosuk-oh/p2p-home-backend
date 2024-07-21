import { relations, sql } from "drizzle-orm";
import {
  customType,
  primaryKey,
  text,
  mysqlTable,
  MySqlColumnWithAutoIncrement,
  bigint,
  varchar,
} from "drizzle-orm/mysql-core";

const timestamp = customType<{
  data: Date;
  driverData: string;
}>({
  dataType() {
    return "timestamp";
  },
  fromDriver(value: string): Date {
    return new Date(value);
  },
});

// users
export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  bio: varchar("bio", { length: 255 }).default(
    "https://api.realworld.io/images/smiley-cyrus.jpeg"
  ),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  comments: many(comments),
  followers: many(userFollows, { relationName: "followed" }),
  following: many(userFollows, { relationName: "follower" }),
  userFavorites: many(userFavorites),
}));

// articles
export const articles = mysqlTable("articles", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
  authorId: bigint("authorId", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const articleRelations = relations(articles, ({ one, many }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
  comments: many(comments),
  tagsArticles: many(tagsArticles),
  userFavorites: many(userFavorites),
}));

// tags
export const tags = mysqlTable("tags", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const tagRelations = relations(tags, ({ many }) => ({
  tagsArticles: many(tagsArticles),
}));

export const tagsArticles = mysqlTable(
  "tagsArticles",
  {
    tagId: bigint("tagId", { mode: "number" })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    articleId: bigint("articleId", { mode: "number" })
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.tagId, t.articleId] }),
  })
);

export const tagsArticlesRelations = relations(tagsArticles, ({ one }) => ({
  tag: one(tags, { fields: [tagsArticles.tagId], references: [tags.id] }),
  article: one(articles, {
    fields: [tagsArticles.articleId],
    references: [articles.id],
  }),
}));

// comments
export const comments = mysqlTable("comments", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement().unique(),
  authorId: bigint("authorId", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  articleId: bigint("articleId", { mode: "number" })
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const commentRelations = relations(comments, ({ one }) => ({
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
}));

// user follows
export const userFollows = mysqlTable(
  "userFollows",
  {
    followerId: bigint("followerId", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followedId: bigint("followedId", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followedId] }),
  })
);

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  followed: one(users, {
    fields: [userFollows.followedId],
    references: [users.id],
    relationName: "followed",
  }),
}));

// user favorites
export const userFavorites = mysqlTable(
  "userFavorites",
  {
    articleId: bigint("articleId", { mode: "number" })
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: bigint("userId", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.articleId, t.userId] }),
  })
);

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  article: one(articles, {
    fields: [userFavorites.articleId],
    references: [articles.id],
  }),
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
}));
