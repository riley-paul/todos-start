// app/routes/__root.tsx
import type { ReactNode } from "react";
import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import RadixProvider from "../components/radix-provider";

import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import "@/styles/theme.css";

import "@fontsource-variable/rubik";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";

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
  const { queryClient } = Route.useRouteContext();
  return (
    <RootDocument>
      <RadixProvider>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
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
