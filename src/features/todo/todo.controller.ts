import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware.js";
import { requireUser } from "../../common/middleware/auth.middleware.js";
import { TodoService } from "./todo.service.js";
import { serializeTodo } from "./todo.serializer.js";
import { Todo } from "./Todo.entity.js";
import { emitToUsers } from "../../realtime/io.js";
import {
  createTodoSchema,
  updateTodoSchema,
  addParticipantsSchema,
  reactionSchema,
} from "./todo.schema.js";

const todoRouter = Router();

// Require user authentication for all todo routes
todoRouter.use(requireUser);

function recipientsOf(todo: Todo): number[] {
  return [todo.owner.id, ...todo.participants.getItems().map((p) => p.id)];
}

function broadcastUpsert(todo: Todo, ids: number[]): void {
  for (const uid of ids) {
    emitToUsers([uid], "todo:upserted", serializeTodo(todo, uid));
  }
}

// Create a todo
todoRouter.post("/", validate(createTodoSchema), async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    const todo = await service.createTodo(req.user.id, req.body);
    broadcastUpsert(todo, recipientsOf(todo));
    res.status(201).json(serializeTodo(todo, req.user.id));
  } catch (err) {
    next(err);
  }
});

// Get user's todos
todoRouter.get("/", async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    const todos = await service.getMyTodos(req.user.id);
    res.status(200).json(todos.map((t) => serializeTodo(t, req.user.id)));
  } catch (err) {
    next(err);
  }
});

// Update a todo
todoRouter.patch("/:id", validate(updateTodoSchema), async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    const todo = await service.updateTodo(req.user.id, Number(req.params.id), req.body);
    broadcastUpsert(todo, recipientsOf(todo));
    res.status(200).json(serializeTodo(todo, req.user.id));
  } catch (err) {
    next(err);
  }
});

// Delete a todo
todoRouter.delete("/:id", async (req: any, res, next) => {
  try {
    const todoId = Number(req.params.id);
    const before = await req.em.findOne(
      Todo,
      { id: todoId },
      { populate: ["owner", "participants"] },
    );
    const ids = before ? recipientsOf(before) : [];

    const service = new TodoService(req.em);
    await service.deleteTodo(req.user.id, todoId);

    if (ids.length > 0) emitToUsers(ids, "todo:deleted", { id: todoId });
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// Toggle completion
todoRouter.post("/:id/toggle", async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    const todo = await service.toggleComplete(req.user.id, Number(req.params.id));
    broadcastUpsert(todo, recipientsOf(todo));
    res.status(200).json(serializeTodo(todo, req.user.id));
  } catch (err) {
    next(err);
  }
});

// Add participants
todoRouter.post(
  "/:id/participants",
  validate(addParticipantsSchema),
  async (req: any, res, next) => {
    try {
      const service = new TodoService(req.em);
      const todo = await service.addParticipant(
        req.user.id,
        Number(req.params.id),
        req.body.userIds,
      );
      broadcastUpsert(todo, recipientsOf(todo));
      res.status(200).json(serializeTodo(todo, req.user.id));
    } catch (err) {
      next(err);
    }
  },
);

// Remove a participant
todoRouter.delete("/:id/participants/:participantId", async (req: any, res, next) => {
  try {
    const todoId = Number(req.params.id);
    const participantId = Number(req.params.participantId);

    const service = new TodoService(req.em);
    await service.removeParticipant(req.user.id, todoId, participantId);

    const after = await req.em.findOne(
      Todo,
      { id: todoId },
      { populate: ["owner", "participants", "reactions", "reactions.user"] },
    );
    if (after) {
      // Remaining members see the updated participant list.
      broadcastUpsert(after, recipientsOf(after));
    }
    // The removed user loses access — drop the card from their dashboard.
    emitToUsers([participantId], "todo:deleted", { id: todoId });

    res.status(200).json({ message: "Participant removed successfully" });
  } catch (err) {
    next(err);
  }
});

// Set or switch a reaction (participants only)
todoRouter.post(
  "/:id/reaction",
  validate(reactionSchema),
  async (req: any, res, next) => {
    try {
      const service = new TodoService(req.em);
      const todo = await service.setReaction(
        req.user.id,
        Number(req.params.id),
        req.body.reaction,
      );
      broadcastUpsert(todo, recipientsOf(todo));
      res.status(200).json(serializeTodo(todo, req.user.id));
    } catch (err) {
      next(err);
    }
  },
);

// Remove a reaction
todoRouter.delete("/:id/reaction", async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    const todo = await service.removeReaction(req.user.id, Number(req.params.id));
    broadcastUpsert(todo, recipientsOf(todo));
    res.status(200).json(serializeTodo(todo, req.user.id));
  } catch (err) {
    next(err);
  }
});

export default todoRouter;
