import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
    } & DefaultSession['user']
  }
  interface JWT {
    accessToken?: string
  }
  interface User {
    accessToken?: string
  }
}

import { authConfig } from '@/auth.config'

const handler = NextAuth(authConfig)

export const auth = handler.auth
export const { handlers: { GET, POST } } = handler