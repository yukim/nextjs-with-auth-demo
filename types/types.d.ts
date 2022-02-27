export type Post = {
    id: string;
    title?: string;
    content?: string;
    created_by?: string;
    updated_at?: string;
}
export type Posts = Post[]

export type Comment = {
    user_id: string;
    commented_at: string;
    comment: string;
}
export type Comments = Comment[]

export type PostResponse = {
    data: {
        posts: {
            values: Posts
        }
        comments?: {
            values: Comments
        }
    };
}

export type CommentResponse = {
    data: {
        comment: {
            value: Comment
        }
    }
}