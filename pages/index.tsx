import type { InferGetStaticPropsType, NextPage } from 'next'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import DateDisplay from '../components/DateDisplay'
import { Post, PostsResponse } from '../types/types'

const url = `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/graphql/${process.env.ASTRA_DB_KEYSPACE}`;

export const getStaticProps: GetStaticProps = async () => {
  const query = `
    query getPosts {
      posts(options: { limit: 10 }) {
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

  const responseBody = await response.json() as PostsResponse;
  return {
    props: {
      posts: responseBody.data.posts.values
    },
  }
}

const Home: NextPage = ({ posts }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <div className="w-full">
      <h2 className="text-lg text-orange-400">新着記事一覧</h2>
      <ul>
        {posts.map(({ id, updated_at, title, created_by }: Post) => {
          return (
            <li key={id}>
              <Link href={`/posts/${id}`}>
                <a className="block p-4 border-b-2 hover:bg-slate-50 ">
                  <div className="text-sm text-gray-400">{updated_at && <DateDisplay value={new Date(updated_at)} />}</div>
                  <div className="text-2xl">{title}</div>
                  <div className="text-sm">作: {created_by}</div>
                </a>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Home
