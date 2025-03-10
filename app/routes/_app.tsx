import AppSearch from "@/components/app-search";
// import PendingInvites from "@/components/pending-invites";
import UserMenu from "@/components/user-menu";
import { userQueryOptions } from "@/lib/client/queries";
import { Heading } from "@radix-ui/themes";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  beforeLoad: async ({ context: { queryClient }, location }) => {
    const user = queryClient.ensureQueryData(userQueryOptions);
    if (!user) {
      throw redirect({ to: "/welcome", search: { redirect: location.href } });
    }
  },
});

function RouteComponent() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-panel-translucent backdrop-blur">
        <div className="container2">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check-double text-7 text-accent-9" />
              <Heading asChild size="6" weight="bold">
                <Link to="/">Todos</Link>
              </Heading>
              {/* <div className="ml-2">
        <StreamStateIcon />
      </div> */}
            </div>
            <div className="flex items-center gap-4">
              <AppSearch />
              {/* <PendingInvites /> */}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      <div className="container2 pb-24 pt-6">
        <Outlet />
      </div>
    </>
  );
}
