import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  ManyToMany,
} from "@mikro-orm/decorators/legacy";

import { Collection } from "@mikro-orm/core";

import { User } from "../auth/User.entity.js";

@Entity()
export class Todo {
  @PrimaryKey({ type: 'number', autoincrement: true })
  id!: number;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'boolean' })
  isCompleted: boolean = false;

  @Property({ type: 'number' })
  createdOn: number = Math.floor(Date.now() / 1000);

  @Property({ type: 'string', nullable: true })
  about?: string;

  @Property({ type: 'date', nullable: true })
  reminderTime?: Date | null;

  @ManyToOne(() => User)
  owner!: User;

  @ManyToMany(() => User)
  participants = new Collection<User>(this);
}
