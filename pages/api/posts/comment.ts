
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import { CommentResponse } from '../../../types/types';

const url = `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/graphql/${process.env.ASTRA_DB_KEYSPACE}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const session = await getSession({ req })
    if (!session || !session.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const { postId, comment } = req.body

    const query = `
      mutation postComment {
        comment:insertcomments(value:{
          post_id:"${postId}"
          commented_at:"${new Date().toISOString()}"
          user_id:"${session.user.name}"
          comment:"${comment.replace(/\r?\n/g, '\\n')}"
        }) {
          value {
            commented_at
            comment
            user_id
          }
        }
      }`
    console.log(query)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cassandra-token": process.env.ASTRA_DB_TOKEN,
      },
      body: JSON.stringify({ query }),
    })

    if (response.ok) {
      const responseBody = await response.json() as CommentResponse;
      if (responseBody.data) {
        res.status(200).json(responseBody.data.comment.value)
      } else {
        res.status(500).json({ message: 'Request failed' })
      }
    } else {
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(400).end('Only POST is allowed')
  }
}