import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
} from "@mikro-orm/decorators/legacy";

import { Collection } from "@mikro-orm/core";
import { Todo } from "../todo/Todo.entity.js";
import { FriendRequest } from "../friend/FriendRequest.entity.js";

@Entity()
export class User {
  @PrimaryKey({ type: 'number', autoincrement: true })
  id!: number;

  @Property({ type: 'string' })
  username!: string;

  @Property({ type: 'string', unique: true })
  email!: string;

  @Property({ type: 'string' })
  passwordHash!: string;

  @OneToMany(() => Todo, (todo) => todo.owner)
  todos = new Collection<Todo>(this);

  @OneToMany(() => FriendRequest, (fr) => fr.sender)
  sentRequests = new Collection<FriendRequest>(this);

  @OneToMany(() => FriendRequest, (fr) => fr.receiver)
  receivedRequests = new Collection<FriendRequest>(this);
}

//basically in here I have defined that every user has many todo's
// has user requests and can send user requests
