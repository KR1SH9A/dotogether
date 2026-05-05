import {
  Entity,
  PrimaryKey,
  Enum,
  Property,
  ManyToOne,
  Unique,
  Index,
} from "@mikro-orm/decorators/legacy";

import { User } from "../auth/User.entity.js";

export enum FriendRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

@Entity()
@Unique({ properties: ["sender", "receiver"] })
@Index({ properties: ["sender"] })
@Index({ properties: ["receiver"] })
export class FriendRequest {
  @PrimaryKey({ type: 'number', autoincrement: true })
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  sender!: User;

  @ManyToOne(() => User, { nullable: false })
  receiver!: User;

  @Enum(() => FriendRequestStatus)
  status: FriendRequestStatus = FriendRequestStatus.PENDING;

  @Property({ type: 'date' })
  createdAt: Date = new Date();
}
