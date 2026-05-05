import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  ManyToMany,
} from "@mikro-orm/decorators/es";

import { Collection } from "@mikro-orm/core";

import { User } from "../auth/User.entity.js";

@Entity()
export class Todo {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  name!: string;

  @Property()
  isCompleted: boolean = false;

  @Property()
  createdOn: number = Math.floor(Date.now() / 1000);

  @Property({ nullable: true })
  about?: string;

  @Property({ nullable: true })
  reminderTime?: Date | null;

  @ManyToOne(() => User)
  owner!: User;

  @ManyToMany(() => User)
  participants = new Collection<User>(this);
}
