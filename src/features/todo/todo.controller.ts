import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware.js";
import { requireUser } from "../../common/middleware/auth.middleware.js";
import { TodoService } from "./todo.service.js";
import {
  createTodoSchema,
  updateTodoSchema,
  addParticipantsSchema,
} from "./todo.schema.js";

const todoRouter = Router();

// Require user authentication for all todo routes
todoRouter.use(requireUser);

// Create a todo
todoRouter.post("/", validate(createTodoSchema), async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    const todo = await service.createTodo(req.user.id, req.body);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// Get user's todos
todoRouter.get("/", async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    const todos = await service.getMyTodos(req.user.id);
    res.status(200).json(todos);
  } catch (err) {
    next(err);
  }
});

// Update a todo
todoRouter.patch("/:id", validate(updateTodoSchema), async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    const todo = await service.updateTodo(req.user.id, Number(req.params.id), req.body);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
});

// Delete a todo
todoRouter.delete("/:id", async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    await service.deleteTodo(req.user.id, Number(req.params.id));
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
    res.status(200).json(todo);
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
        req.body.userIds
      );
      res.status(200).json(todo);
    } catch (err) {
      next(err);
    }
  }
);

// Remove a participant
todoRouter.delete("/:id/participants/:participantId", async (req: any, res, next) => {
  try {
    const service = new TodoService(req.em);
    await service.removeParticipant(
      req.user.id,
      Number(req.params.id),
      Number(req.params.participantId)
    );
    res.status(200).json({ message: "Participant removed successfully" });
  } catch (err) {
    next(err);
  }
});

export default todoRouter;
