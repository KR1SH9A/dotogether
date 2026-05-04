import { User } from "../auth/User.entity";
import { Todo } from "./Todo.entity";
import { AppError } from "../../common/errors/AppError";
import {
  FriendRequest,
  FriendRequestStatus,
} from "../friend/FriendRequest.entity";
import { EntityManager } from "@mikro-orm/postgresql";

export class TodoService {
  constructor(private em: EntityManager) {}

  //check if users are friends
  private async getFriendsOfUser(userId: number) {
    const requests = await this.em.find(
      FriendRequest,
      {
        status: FriendRequestStatus.ACCEPTED,
        $or: [{ sender: userId }, { receiver: userId }],
      },
      {
        populate: ["sender", "receiver"],
      },
    );

    return requests.map((r) =>
      r.sender.id === userId ? r.receiver : r.sender,
    );
  }

  //helper to check user existance because I was facing many issues for this
  private async userHelper(userId: number) {
    const user = await this.em.findOne(User, { id: userId });

    if (!user) {
      throw new AppError("User doesn't exist", 404);
    }
    return user;
  }

  // some helpers for todo
  private async getTodoHelper(todoId: number) {
    const todo = await this.em.findOne(
      Todo,
      {
        id: todoId,
      },
      {
        populate: ["owner", "participants"],
      },
    );

    if (!todo) {
      throw new AppError("Oops! can't find this todo.", 404);
    }
    return todo;
  }
  private ensureOwner(userId: number, todo: Todo) {
    if (todo.owner.id !== userId) {
      throw new AppError("Sorry, you don't have ownership of this todo", 403);
    }
  }
  private isParticipant(userId: number, todo: Todo) {
    return todo.participants.getItems().some((u) => u.id === userId);
  }

  //creating a todo
  async createTodo(
    userId: number,
    input: {
      name: string;
      about?: string;
      reminderTime: Date | null;
    },
  ) {
    // const user = await this.em.findOne(User, { id: userId });
    const user = await this.userHelper(userId);
    if (!user) {
      throw new AppError("User doesn't exist", 404);
    }
    const todo = new Todo();
    todo.name = input.name;
    todo.about = input.about ?? "";
    todo.reminderTime = input.reminderTime ?? null;
    todo.owner = user;

    this.em.persist(todo);
    await this.em.flush();
    return todo;
  }

  //get the todos
  async getMyTodos(userId: number) {
    return this.em.find(
      Todo,
      {
        $or: [{ owner: userId }, { participants: userId }],
      },
      { populate: ["owner", "participants"] },
    );
  }

  //update a todo
  async updateTodo(
    userId: number,
    todoId: number,
    updates: {
      name?: string;

      about?: string;

      reminderTime?: Date | null;
    },
  ) {
    const todo = await this.getTodoHelper(todoId);

    this.ensureOwner(userId, todo);

    if (updates.name !== undefined) todo.name = updates.name;
    if (updates.about !== undefined) todo.about = updates.about;
    if (updates.reminderTime !== undefined) {
      todo.reminderTime = updates.reminderTime;
    }

    await this.em.flush();
    return todo;
  }

  //delete a todo

  async deleteTodo(userId: number, todoId: number) {
    const todo = await this.getTodoHelper(todoId);

    this.ensureOwner(userId, todo);

    await this.em.remove(todo).flush();
  }

  //both owner of the todo and participant can toggle completion
  async toggleComplete(userId: number, todoId: number) {
    const todo = await this.getTodoHelper(todoId);

    const allowed =
      todo.owner.id === userId || this.isParticipant(userId, todo);

    if (!allowed) {
      throw new AppError("Only owner and participants can toggle", 403);
    }

    todo.isCompleted = !todo.isCompleted;
    await this.em.flush();
    return todo;
  }

  //add friends to todo
  async addParticipant(userId: number, todoId: number, userIds: number[]) {
    const todo = await this.getTodoHelper(todoId);
    this.ensureOwner(userId, todo);

    const friends = await this.getFriendsOfUser(userId);
    const friendsId = new Set(friends.map((f) => f.id));

    const users = await this.em.find(User, {
      id: { $in: userIds },
    });
    if (users.length !== userIds.length) {
      throw new AppError("Some users not found", 404);
    }
    for (const user of users) {
      if (user.id === userId) continue;
      if (!friendsId.has(user.id)) {
        throw new AppError(`${user.id} is not your friend!`, 403);
      }

      if (!this.isParticipant(user.id, todo)) {
        todo.participants.add(user);
      }
    }

    await this.em.flush();
    return todo;
  }

  //remove a participant
  async removeParticipant(
    userId: number,
    todoId: number,
    participantId: number,
  ) {
    const todo = await this.getTodoHelper(todoId);

    this.ensureOwner(userId, todo);

    const participant = await this.em.findOne(User, { id: participantId });

    if (!participant) {
      throw new AppError("Participant not found", 404);
    }

    todo.participants.remove(participant);

    await this.em.flush();
  }
}
