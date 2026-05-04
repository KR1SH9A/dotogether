import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
} from "@mikro-orm/decorators/es";

import { Collection } from "@mikro-orm/core";
import { Todo } from "../todo/Todo.entity";
import { FriendRequest } from "../friend/FriendRequest.entity";

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  username!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
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
