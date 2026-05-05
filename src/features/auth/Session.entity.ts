import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from "@mikro-orm/decorators/legacy";

import { User } from "./User.entity.js";

@Entity()
export class Session {
  @PrimaryKey({ type: 'string' })
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'date' })
  createdAt: Date = new Date();
}
