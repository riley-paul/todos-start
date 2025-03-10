import Todos from "@/components/todos";
// import { todosQueryOptions } from "@/lib/queries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_withAdder/todos/$listId")({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params: { listId } }) => {
    // queryClient.ensureQueryData(todosQueryOptions(listId));
  },
});

function RouteComponent() {
  const { listId } = Route.useParams();
  return null;
  return <Todos listId={listId} />;
}
