import { Migration } from '@mikro-orm/migrations';

export class Migration20260509225040 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "todo_reaction" ("id" serial primary key, "todo_id" int not null, "user_id" int not null, "reaction" varchar(16) not null, "created_at" int not null);`);
    this.addSql(`alter table "todo_reaction" add constraint "todo_reaction_todo_id_user_id_unique" unique ("todo_id", "user_id");`);
    this.addSql(`alter table "todo_reaction" add constraint "todo_reaction_todo_id_foreign" foreign key ("todo_id") references "todo" ("id") on delete cascade;`);
    this.addSql(`alter table "todo_reaction" add constraint "todo_reaction_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "todo_reaction" cascade;`);
  }

}
