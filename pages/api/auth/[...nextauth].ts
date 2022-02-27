import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

const USERS = process.env.USERS.split(",") || ['admin'];

export default NextAuth({
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Sign in",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const id = USERS.findIndex(user => user === credentials?.username)
                if (id < 0) {
                    return null
                }
                if (process.env.MASTER_PASSWORD === credentials?.password) {
                    return { id: id + 1, name: credentials?.username }
                } else {
                    return null
                }
            }
        })
    ]
})