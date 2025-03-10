import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/welcome')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/welcome"!</div>
}
