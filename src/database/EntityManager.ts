//A basic entity manager for ORM to preserve a singleton pattern
// while forking

import { MikroORM } from "@mikro-orm/postgresql";

export const createRequestContext = (orm: MikroORM) => {
  return orm.em.fork();
};
