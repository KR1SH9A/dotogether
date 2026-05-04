import { Todo } from "./Todo.entity";

export function serializeTodo(todo: Todo) {
  return {
    id: todo.id,
    name: todo.name,
    isCompleted: todo.isCompleted,
    about: todo.about,
    reminderTime: todo.reminderTime,

    owner: {
      id: todo.owner.id,
      username: todo.owner.username,
    },

    participants: todo.participants.getItems().map((u) => ({
      id: u.id,
      username: u.username,
    })),
  };
}
