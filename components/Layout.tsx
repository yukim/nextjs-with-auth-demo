import { signIn, signOut, useSession } from "next-auth/react"
import Head from "next/head"
import Link from "next/link"
import React, { FC } from "react"

const Layout: FC = ({ children }) => {
    const { data: session } = useSession()
    return (
        <div className="h-screen flex flex-col items-center">
            <Head>
                <title>コメントデモ</title>
                <meta name="description" content="next.js 認証/API Routingデモ" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header className="flex justify-between w-screen p-10 bg-gray-100 text-xl text-center">
                <h1><Link href="/">Next.jsで認証とユーザー固有のアクションデモ</Link></h1>
                <div className="flex items-center relative">
                    {session && session.user && <div>{session.user.name} / <button onClick={() => signOut()}>ログアウト</button></div>}
                    {!session && <button onClick={() => signIn()}>ログイン</button>}
                </div>
            </header>
            <main className="flex flex-1 py-4 px-10 w-1/2 overflow-y-auto">
                {children}
            </main>
            <footer className="w-screen p-4 justify-center text-center">
                &copy; 2022
            </footer>
        </div>
    )
}

export default Layout