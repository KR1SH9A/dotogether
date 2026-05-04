import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  ManyToMany,
} from "@mikro-orm/decorators/es";

import { Collection } from "@mikro-orm/core";

import { User } from "../auth/User.entity";

@Entity()
export class Todo {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  isCompleted: boolean = false;

  @Property()
  createdOn: number = Math.floor(Date.now() / 1000);

  @Property()
  about?: string;

  @Property()
  reminderTime?: Date | null;

  @ManyToOne(() => User)
  owner!: User;

  @ManyToMany(() => User)
  participants = new Collection<User>(this);
}
