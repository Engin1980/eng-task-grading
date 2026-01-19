// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './../routeTree.gen' // automaticky generované

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Registrace pro TypeScript (volitelné, ale doporučené)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}