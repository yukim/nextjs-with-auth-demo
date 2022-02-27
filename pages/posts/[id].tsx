import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { FormEvent, useState } from "react";
import { ParsedUrlQuery } from "querystring";
import { signIn, useSession } from "next-auth/react";
import DateDisplay from "../../components/DateDisplay";
import { Comments, Post, PostResponse } from "../../types/types";

const url = `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/graphql/${process.env.ASTRA_DB_KEYSPACE}`;

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const query = `
  query getPosts {
    posts(options: { limit: 10 }) {
      values {
        id
      }
    }
  }`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cassandra-token": process.env.ASTRA_DB_TOKEN,
    },
    body: JSON.stringify({ query }),
  })

  const responseBody = await response.json() as PostResponse;
  const paths = responseBody.data.posts.values.map(({ id }) => ({
    params: { id },
  }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<{ post: Post, comments?: Comments }, Params> = async (context) => {
  const { id } = context.params!;

  const query = `
  query getPostWithComments {
    posts(value: {id:"${id}"}) {
      values {
        id
        title
        content
        created_by
        updated_at
      }
    }
    comments(value: {post_id:"${id}"}) {
      values{
        commented_at
        user_id
        comment
      }
    }
  }`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cassandra-token": process.env.ASTRA_DB_TOKEN,
    },
    body: JSON.stringify({ query }),
  })

  if (response.ok) {
    const responseBody = await response.json() as PostResponse;
    if (responseBody.data.posts.values.length === 0) {
      return {
        notFound: true,
      }
    } else {
      return {
        props: {
          post: responseBody.data.posts.values[0],
          comments: responseBody.data.comments?.values,
        }
      }
    }
  } else {
    return {
      notFound: true,
    }
  }
}

const PostPage: NextPage<{ post: Post, comments?: Comments }> = ({ post, comments: staticComments }) => {
  const [comments, setComments] = useState<Comments>(staticComments || [])
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
      const comment = await res.json() as Comment
      setComments((prevComments) => [comment, ...prevComments] as Comments)
    }
  }
  const bodyDisplay = post.content?.split(/\\n/).map((line, index) => {
    return (<p className="py-2" key="{index}" > {line} </p>)
  })
  return (
    <div className="w-full">
      <h1 className="text-4xl text-orange-400">{post.title}</h1>
      <div className="text-sm text-gray-400 text-right">by {post.created_by} / {post.updated_at && <DateDisplay format="dateTime" value={post.updated_at} />}</div>
      <div className="py-10 border-b-2 mb-4" >
        {bodyDisplay}
      </div>
      {comments && comments.length > 0 && (
        <div>
          <div>コメント:</div>
          {comments.map(({ user_id, comment, commented_at }) => {
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
            <input type="hidden" name="postId" value={post.id} />
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
    </div>
  )
}
export default PostPage