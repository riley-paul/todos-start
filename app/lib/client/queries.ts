import { queryOptions } from "@tanstack/react-query";
import type { SelectedList } from "@/lib/types";
import { user_getMe } from "@/actions/users";

// export const todosQueryOptions = (listId: SelectedList) =>
//   queryOptions({
//     queryKey: ["todos", listId],
//     queryFn: () => actions.todos.get.orThrow({ listId }),
//   });

export const userQueryOptions = queryOptions({
  queryKey: ["profile"],
  retry: false,
  queryFn: user_getMe,
});

// export const listsQueryOptions = queryOptions({
//   queryKey: ["lists"],
//   queryFn: actions.lists.get.orThrow,
//   select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
// });

// export const pendingSharesQueryOptions = queryOptions({
//   queryKey: ["pendingShares"],
//   queryFn: actions.listShares.getPending.orThrow,
// });
