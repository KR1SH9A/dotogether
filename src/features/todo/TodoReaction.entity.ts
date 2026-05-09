import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Unique,
} from "@mikro-orm/decorators/es";

import { Todo } from "./Todo.entity.js";
import { User } from "../auth/User.entity.js";

export enum ReactionType {
  LIKE = "like",
  DISLIKE = "dislike",
}

@Entity()
@Unique({ properties: ["todo", "user"] })
export class TodoReaction {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @ManyToOne(() => Todo)
  todo!: Todo;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  reaction!: ReactionType;

  @Property()
  createdAt: number = Math.floor(Date.now() / 1000);
}
