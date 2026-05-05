//MikroORM setup with the database and entity discovery for migrations
import "dotenv/config";
import { defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { GeneratedCacheAdapter } from "@mikro-orm/core";

//manually introducing entities for now,
import { User } from "../features/auth/User.entity.js";
import { Session } from "../features/auth/Session.entity.js";
import { FriendRequest } from "../features/friend/FriendRequest.entity.js";
import { Todo } from "../features/todo/Todo.entity.js";

export default defineConfig({
  dbName: process.env.DATABASE_NAME || "dummy_db",
  clientUrl: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",

  driverOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },

  metadataProvider: TsMorphMetadataProvider,
  metadataCache: { 
    enabled: process.env.NODE_ENV === "production",
    ...(process.env.NODE_ENV === "production" ? { adapter: GeneratedCacheAdapter } : {}),
    options: { cacheDir: process.cwd() + '/temp' }
  },
  entities: [User, Session, FriendRequest, Todo],
  // entitiesTs: ["src/features/**/*.entity.ts"],

  debug: process.env.NODE_ENV !== "production",

  extensions: [Migrator],

  migrations: {
    path: "./src/database/migrations",
    pathTs: "./src/database/migrations",

    glob: "!(*.d).{ts,js}",
  },
});
