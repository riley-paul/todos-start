/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as WithAdderImport } from './routes/_withAdder'
import { Route as WithAdderIndexImport } from './routes/_withAdder.index'
import { Route as WithAdderTodosListIdImport } from './routes/_withAdder.todos.$listId'

// Create/Update Routes

const WithAdderRoute = WithAdderImport.update({
  id: '/_withAdder',
  getParentRoute: () => rootRoute,
} as any)

const WithAdderIndexRoute = WithAdderIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => WithAdderRoute,
} as any)

const WithAdderTodosListIdRoute = WithAdderTodosListIdImport.update({
  id: '/todos/$listId',
  path: '/todos/$listId',
  getParentRoute: () => WithAdderRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_withAdder': {
      id: '/_withAdder'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof WithAdderImport
      parentRoute: typeof rootRoute
    }
    '/_withAdder/': {
      id: '/_withAdder/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof WithAdderIndexImport
      parentRoute: typeof WithAdderImport
    }
    '/_withAdder/todos/$listId': {
      id: '/_withAdder/todos/$listId'
      path: '/todos/$listId'
      fullPath: '/todos/$listId'
      preLoaderRoute: typeof WithAdderTodosListIdImport
      parentRoute: typeof WithAdderImport
    }
  }
}

// Create and export the route tree

interface WithAdderRouteChildren {
  WithAdderIndexRoute: typeof WithAdderIndexRoute
  WithAdderTodosListIdRoute: typeof WithAdderTodosListIdRoute
}

const WithAdderRouteChildren: WithAdderRouteChildren = {
  WithAdderIndexRoute: WithAdderIndexRoute,
  WithAdderTodosListIdRoute: WithAdderTodosListIdRoute,
}

const WithAdderRouteWithChildren = WithAdderRoute._addFileChildren(
  WithAdderRouteChildren,
)

export interface FileRoutesByFullPath {
  '': typeof WithAdderRouteWithChildren
  '/': typeof WithAdderIndexRoute
  '/todos/$listId': typeof WithAdderTodosListIdRoute
}

export interface FileRoutesByTo {
  '/': typeof WithAdderIndexRoute
  '/todos/$listId': typeof WithAdderTodosListIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_withAdder': typeof WithAdderRouteWithChildren
  '/_withAdder/': typeof WithAdderIndexRoute
  '/_withAdder/todos/$listId': typeof WithAdderTodosListIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '' | '/' | '/todos/$listId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/todos/$listId'
  id: '__root__' | '/_withAdder' | '/_withAdder/' | '/_withAdder/todos/$listId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  WithAdderRoute: typeof WithAdderRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  WithAdderRoute: WithAdderRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_withAdder"
      ]
    },
    "/_withAdder": {
      "filePath": "_withAdder.tsx",
      "children": [
        "/_withAdder/",
        "/_withAdder/todos/$listId"
      ]
    },
    "/_withAdder/": {
      "filePath": "_withAdder.index.tsx",
      "parent": "/_withAdder"
    },
    "/_withAdder/todos/$listId": {
      "filePath": "_withAdder.todos.$listId.tsx",
      "parent": "/_withAdder"
    }
  }
}
ROUTE_MANIFEST_END */
