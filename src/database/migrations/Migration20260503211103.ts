import { Migration } from '@mikro-orm/migrations';

export class Migration20260503211103 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "email" varchar(255) not null, "password_hash" varchar(255) not null);`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "todo" ("id" serial primary key, "name" varchar(255) not null, "is_completed" boolean not null default false, "created_on" int not null, "about" varchar(255) null, "reminder_time" timestamptz null, "owner_id" int not null);`);

    this.addSql(`create table "session" ("id" varchar(255) not null, "user_id" int not null, "created_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`create table "friend_request" ("id" serial primary key, "sender_id" int not null, "receiver_id" int not null, "status" text not null default 'pending', "created_at" timestamptz not null);`);
    this.addSql(`create index "friend_request_receiver_id_index" on "friend_request" ("receiver_id");`);
    this.addSql(`create index "friend_request_sender_id_index" on "friend_request" ("sender_id");`);
    this.addSql(`alter table "friend_request" add constraint "friend_request_sender_id_receiver_id_unique" unique ("sender_id", "receiver_id");`);
    this.addSql(`alter table "friend_request" add constraint "friend_request_status_check" check ("status" in ('pending', 'accepted', 'rejected'));`);

    this.addSql(`alter table "todo" add constraint "todo_owner_id_foreign" foreign key ("owner_id") references "user" ("id");`);

    this.addSql(`alter table "session" add constraint "session_user_id_foreign" foreign key ("user_id") references "user" ("id");`);

    this.addSql(`alter table "friend_request" add constraint "friend_request_sender_id_foreign" foreign key ("sender_id") references "user" ("id");`);
    this.addSql(`alter table "friend_request" add constraint "friend_request_receiver_id_foreign" foreign key ("receiver_id") references "user" ("id");`);
  }

}
