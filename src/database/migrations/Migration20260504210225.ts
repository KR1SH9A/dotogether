import { Migration } from '@mikro-orm/migrations';

export class Migration20260504210225 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "todo_participants" ("todo_id" int not null, "user_id" int not null, primary key ("todo_id", "user_id"));`);

    this.addSql(`alter table "todo_participants" add constraint "todo_participants_todo_id_foreign" foreign key ("todo_id") references "todo" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "todo_participants" add constraint "todo_participants_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "user" add "username" varchar(255) not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "todo_participants" cascade;`);

    this.addSql(`alter table "user" drop column "username";`);
  }

}
