import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from "@mikro-orm/decorators/es";

import { User } from "./User.entity";

@Entity()
export class Session {
  @PrimaryKey()
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  createdAt: Date = new Date();
}
