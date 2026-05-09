import { Todo } from "./Todo.entity.js";
import { ReactionType } from "./TodoReaction.entity.js";

export function serializeTodo(todo: Todo, currentUserId: number) {
  const reactions = todo.reactions.getItems();
  const likesCount = reactions.filter((r) => r.reaction === ReactionType.LIKE).length;
  const dislikesCount = reactions.filter(
    (r) => r.reaction === ReactionType.DISLIKE,
  ).length;
  const isOwner = todo.owner.id === currentUserId;
  const myReaction = isOwner
    ? null
    : reactions.find((r) => r.user.id === currentUserId)?.reaction ?? null;

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

    likesCount,
    dislikesCount,
    myReaction,
  };
}
