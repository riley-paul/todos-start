// app/routes/__root.tsx
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import RadixProvider from "../components/radix-provider";

import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import "@/styles/theme.css";

import "@fontsource-variable/rubik";

export const Route = createRootRoute({
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
});

function RootComponent() {
  return (
    <RootDocument>
      <RadixProvider>
        <Outlet />
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
