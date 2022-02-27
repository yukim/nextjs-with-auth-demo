import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { ParsedUrlQuery } from "querystring";
import { Post, PostsResponse } from "../../types/types";
import DateDisplay from "../../components/DateDisplay";
import CommentSection from "../../components/CommentList";

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

  const responseBody = await response.json() as PostsResponse;
  const paths = responseBody.data.posts.values.map(({ id }) => ({
    params: { id },
  }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<{ post: Post }, Params> = async (context) => {
  const { id } = context.params!;

  const query = `
  query getPosts {
    posts(value: {id:"${id}"}) {
      values {
        id
        title
        content
        created_by
        updated_at
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
    const responseBody = await response.json() as PostsResponse;
    if (responseBody.data.posts.values.length === 0) {
      return {
        notFound: true,
      }
    } else {
      return {
        props: {
          post: responseBody.data.posts.values[0],
        }
      }
    }
  } else {
    return {
      notFound: true,
    }
  }
}

const PostPage: NextPage<{ post: Post }> = ({ post }) => {
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
      <CommentSection postId={post.id} />
    </div>
  )
}
export default PostPage