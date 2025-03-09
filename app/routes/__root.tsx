// app/routes/__root.tsx
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import RadixProvider from "../components/radix-provider";

import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import "@/styles/theme.css";

import "@fontsource-variable/rubik";
import { Heading } from "@radix-ui/themes";
import AppSearch from "@/components/app-search";
import PendingInvites from "@/components/pending-invites";
import UserMenu from "@/components/user-menu";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { title: "TanStack Start Starter" },
      ],
      links: [
        { rel: "stylesheet", href: "/fontawesome/css/fontawesome.css" },
        { rel: "stylesheet", href: "/fontawesome/css/brands.css" },
        { rel: "stylesheet", href: "/fontawesome/css/solid.css" },
      ],
    }),
    component: RootComponent,
  }
);

function RootComponent() {
  return (
    <RootDocument>
      <RadixProvider>
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
                <PendingInvites />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>
        <div className="container2 pb-24 pt-6">
          <Outlet />
        </div>
      </RadixProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
