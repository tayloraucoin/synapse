import {
  removedTodoInput,
  removedTodoOutput,
  todoDoneInput,
  todoIdInput,
  todoInput,
  todoRecord,
  todosReadInput,
  todosReadOutput,
  todoUpdateInput,
} from "@syn/validators";
import { todoStore } from "../services/todos/todo-store";
import {
  createTodo,
  listTodos,
  removeTodo,
  restoreTodo,
  setTodoDone,
  updateTodo,
} from "../services/todos/todos";
import { recordUndo } from "../services/undo/undo";
import { protectedProcedure, router } from "../trpc";

/**
 * To-dos (USE-95): the fixture server's `readTodos`, `writeTodo`,
 * `updateTodo`, `writeTodoDone`, `removeTodo` and `restoreTodo`, live. Each
 * runs in one RLS transaction. `remove` hands back what went, which
 * `restore` takes, and the same as a `planner.undo` token, so either puts
 * the to-do, its slots and their events back.
 */
export const todoRouter = router({
  list: protectedProcedure
    .input(todosReadInput)
    .output(todosReadOutput)
    .query(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        listTodos(todoStore(tx, ctx.authContext.userId), input.dateKey),
      ),
    ),

  create: protectedProcedure
    .input(todoInput)
    .output(todoRecord)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        createTodo(todoStore(tx, ctx.authContext.userId), input, new Date()),
      ),
    ),

  update: protectedProcedure
    .input(todoUpdateInput)
    .output(todoRecord)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        updateTodo(todoStore(tx, ctx.authContext.userId), input, new Date()),
      ),
    ),

  setDone: protectedProcedure
    .input(todoDoneInput)
    .output(todoRecord)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        setTodoDone(todoStore(tx, ctx.authContext.userId), input, new Date()),
      ),
    ),

  remove: protectedProcedure
    .input(todoIdInput)
    .output(removedTodoOutput)
    .mutation(({ ctx, input }) => {
      const userId = ctx.authContext.userId;
      return ctx.rls.execute(async (tx) => {
        const { removed, changes } = await removeTodo(
          todoStore(tx, userId),
          input.id,
        );
        return { ...removed, undo: recordUndo(changes, userId) };
      });
    }),

  restore: protectedProcedure
    .input(removedTodoInput)
    .output(todoRecord)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        restoreTodo(todoStore(tx, ctx.authContext.userId), input),
      ),
    ),
});
