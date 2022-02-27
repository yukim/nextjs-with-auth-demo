import type { NextApiRequest, NextApiResponse } from 'next'
import { Comments, CommentsResponse } from '../../../types/types';

const url = `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/graphql/${process.env.ASTRA_DB_KEYSPACE}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Comments | { message: string }>
) {
  const { postId } = req.query
  const query = `
  query getComments {
    comments(value: {post_id:"${postId}"}) {
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
    const responseBody = await response.json() as CommentsResponse;
    res.status(200).json(responseBody.data.comments.values)
  } else {
    res.status(500).json({ message: 'Fetching comment failed' })
  }
}