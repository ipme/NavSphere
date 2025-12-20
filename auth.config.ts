import GithubProvider from 'next-auth/providers/github'
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            authorization: {
                params: { scope: 'repo' }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account?.access_token) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.accessToken = token.accessToken as string
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/signin'
    },
    secret: process.env.GITHUB_SECRET
} satisfies NextAuthConfig
