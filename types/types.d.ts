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

export type PostsResponse = {
    data: {
        posts: {
            values: Posts
        }
    };
}

export type CommentsResponse = {
    data: {
        comments: {
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