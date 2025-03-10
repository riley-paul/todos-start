import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listsQueryOptions, todosQueryOptions } from "@/lib/client/queries";
import type { SelectedList, TodoSelect } from "@/lib/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { goToList } from "@/lib/client/links";
import { useServerFn } from "@tanstack/react-start";
import {
  todo_create,
  todo_remove,
  todo_removeCompleted,
  todo_update,
} from "@/actions/todos";
import { user_remove } from "@/actions/users";
import { list_create, list_update } from "@/actions/lists";
import { listShare_create } from "@/actions/list-shares";

type TodosUpdater = (todos: TodoSelect[] | undefined) => TodoSelect[];
type Resetter = () => void;

export const handleMutationError = (error: Error) => {
  console.error(error);

  let status = 500;
  let description = error.message;

  toast.error(`${status} Error`, { description });
};

export default function useMutations() {
  const queryClient = useQueryClient();

  const { listId } = useParams({ strict: false });
  const selectedList = listId ?? null;

  const navigate = useNavigate();

  const modifyTodoCache = async (
    listId: SelectedList,
    updater: TodosUpdater
  ) => {
    const queryKey = todosQueryOptions(listId).queryKey;
    await queryClient.cancelQueries({ queryKey });

    const previous = queryClient.getQueryData(queryKey);
    const reset: Resetter = () => {
      queryClient.setQueryData(queryKey, previous);
    };

    queryClient.setQueryData<TodoSelect[]>(queryKey, updater);
    return reset;
  };

  const updateTodoFn = useServerFn(todo_update);
  const updateTodo = useMutation({
    mutationFn: updateTodoFn,
    onMutate: async ({ data }) => {
      const updater: TodosUpdater = (todos = []) =>
        todos.map((todo) =>
          todo.id === data.id ? { ...todo, ...data } : todo
        );

      const resetters = await Promise.all([
        modifyTodoCache(selectedList, updater),
        modifyTodoCache("all", updater),
      ]);

      return { resetters };
    },
    onError: (error, _, context) => {
      handleMutationError(error);
      context?.resetters.forEach((reset) => reset());
    },
  });

  const deleteTodoFn = useServerFn(todo_remove);
  const deleteTodo = useMutation({
    mutationFn: deleteTodoFn,
    onMutate: async ({ data: { id } }) => {
      const updater: TodosUpdater = (todos = []) =>
        todos.filter((todo) => todo.id !== id);

      const resetters = await Promise.all([
        modifyTodoCache(selectedList, updater),
        modifyTodoCache("all", updater),
      ]);

      return { resetters };
    },
    onError: (error, _, context) => {
      handleMutationError(error);
      context?.resetters.forEach((reset) => reset());
    },
    onSuccess: () => {
      toast.success("Todo deleted");
    },
  });

  const deleteCompletedTodosFn = useServerFn(todo_removeCompleted);
  const deleteCompletedTodos = useMutation({
    mutationFn: deleteCompletedTodosFn,
    onSuccess: () => {
      toast.success("Completed todos deleted");
    },
  });

  const createTodoFn = useServerFn(todo_create);
  const createTodo = useMutation({
    mutationFn: createTodoFn,
    onSuccess: ({ listId }) => {
      navigate(goToList(listId));
    },
  });

  const moveTodoFn = useServerFn(todo_update);
  const moveTodo = useMutation({
    mutationFn: moveTodoFn,
    onMutate: async ({ data: { id } }) => {
      const resetters: Resetter[] = await Promise.all(
        selectedList === "all"
          ? []
          : [
              modifyTodoCache(selectedList, (todos = []) =>
                todos.filter((todo) => todo.id !== id)
              ),
            ]
      );
      return { resetters };
    },
    onError: (__, _, context) => {
      context?.resetters.forEach((reset) => reset());
    },
    onSuccess: (_, { data: { listId } }) => {
      const lists = queryClient.getQueryData(listsQueryOptions.queryKey);
      const nextList = lists?.find((list) => list.id === listId);
      toast.success(`Todo moved to ${nextList?.name ?? "Unknown"}`);
    },
  });

  const deleteUserFn = useServerFn(user_remove);
  const deleteUser = useMutation({
    mutationFn: deleteUserFn,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const updateListFn = useServerFn(list_update);
  const updateList = useMutation({
    mutationFn: updateListFn,
  });

  const createListFn = useServerFn(list_create);
  const createList = useMutation({
    mutationFn: createListFn,
    onSuccess: ({ id }, { data }) => {
      toast.success(`List "${data.name}" created`);
      navigate(goToList(id));
    },
  });

  const createListShareFn = useServerFn(listShare_create);
  const createListShare = useMutation({
    mutationFn: createListShareFn,
  });

  return {
    updateTodo,
    deleteTodo,
    deleteCompletedTodos,
    createTodo,
    moveTodo,
    deleteUser,
    updateList,
    createList,
    createListShare,
  };
}
