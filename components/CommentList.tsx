import { signIn, useSession } from "next-auth/react";
import { FC, FormEvent } from "react";
import useSWR, { Fetcher, useSWRConfig } from "swr";
import { Comments } from "../types/types";
import DateDisplay from "./DateDisplay";

const url = `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/graphql/${process.env.ASTRA_DB_KEYSPACE}`;

type CommentsValue = {
  postId: string;
}

const fetcher: Fetcher<Comments, string> = async (postId) => {
  const res = await fetch(`/api/comments/${postId}`)
  if (res.ok) {
    const body = await res.json() as Comments
    return body
  } else {
    throw new Error(res.statusText)
  }
}

const CommentSection: FC<CommentsValue> = ({ postId }) => {
  const { data, error } = useSWR<Comments>(postId, fetcher)
  const { mutate } = useSWRConfig()
  const { data: session, status } = useSession()

  const postComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const res = await fetch('/api/posts/comment', {
      body: new URLSearchParams([...(new FormData(form) as any)]),
      method: 'POST'
    })

    if (res.ok) {
      form.reset()
      mutate(postId)
    }
  }

  return (
    <>
      {!data && <p>コメントロード中...</p>}
      {data && data.length > 0 && (
        <div>
          <div>コメント:</div>
          {data.map(({ user_id, comment, commented_at }) => {
            return (
              <figure key={user_id + commented_at} className="bg-slate-100 mb-1 rounded-xl p-4">
                <div className="pt-2 text-left space-y-4">
                  <blockquote>
                    <p className="text-lg font-light">{comment}</p>
                  </blockquote>
                  <figcaption className="font-medium">
                    <div className="text-sky-500">{user_id}</div>
                    <div className="text-slate-700 text-sm"><DateDisplay format="dateTime" value={commented_at} /></div>
                  </figcaption>
                </div>
              </figure>
            )
          })}
        </div>
      )}
      <section>
        {session && (
          <form method="post" onSubmit={postComment}>
            <input type="hidden" name="postId" value={postId} />
            <textarea id="comment" name="comment" className="w-full form-control border rounded-xl p-4" autoComplete="name" required></textarea>
            <div>
              <button type="submit">コメントする</button>
            </div>
          </form>
        )}
        {!session && (
          <div><button onClick={() => signIn()}>ログイン</button>してコメントする</div>
        )}
      </section>
    </>
  )
}

export default CommentSection