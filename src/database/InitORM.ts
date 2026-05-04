import { MikroORM } from "@mikro-orm/postgresql";
import defineConfig from "./MikroORMConfig";

let orm: MikroORM | null = null;

export const InitORM = async (): Promise<MikroORM> => {
  if (!orm) {
    orm = await MikroORM.init(defineConfig);
    console.log("ORM is up!");
  }
  return orm;
};
