import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";
import { useGetPostsQuery, useGetUserQuery, useUpdateReactionsMutation, useAddCommentMutation } from "../../app/apiSlice";
import { postInterface, userInterface } from "../../app/interfaces";

const Post: React.FC = function() {
    const [ addCommentVis, setAddCommentVis ] = useState(false);
    const [ content, setContent ] = useState("");

    const { bedid, postid } = useParams();

    const postObject = useGetPostsQuery(bedid, {
        selectFromResult: ({ data }) => ({
            post: data?.find(post => post?.id === postid)
        }),
    });
    const post = postObject.post as postInterface;

    const { data } = useGetUserQuery(undefined);
    const user = data as userInterface;

    const [ updateReactions, { isLoading: updateReactionsIsLoading } ] = useUpdateReactionsMutation();
    const [ addComment, { isLoading: addCommentIsLoading } ] = useAddCommentMutation();

    async function updateReaction(type: string) {
        if (type === "like" && !updateReactionsIsLoading) {
            try {
                let updatedLikes: number[] = [];
                if (post?.likes.includes(user?.id)) {
                    updatedLikes = post.likes.filter(id => id !== user.id);
                } else {
                    updatedLikes = [...post.likes, user.id]
                };

                await updateReactions({
                    table: "posts",
                    id: post.id,
                    reaction: {
                        likes: updatedLikes
                    }
                }).unwrap();
            } catch(err) {
                console.error("Unable to update likes: ", err.message);
            };
        };

        if (type === "dislike" && !updateReactionsIsLoading) {
            try {
                let updatedDislikes: number[] = [];
                if (post?.dislikes.includes(user?.id)) {
                    updatedDislikes = post.dislikes.filter(id => id !== user.id);
                } else {
                    updatedDislikes = [...post.dislikes, user.id]
                };

                await updateReactions({
                    table: "posts",
                    id: post.id,
                    reaction: {
                        dislikes: updatedDislikes
                    }
                }).unwrap();
            } catch(err) {
                console.error("Unable to update dislikes: ", err.message);
            };
        };
    };

    async function postComment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (content && !addCommentIsLoading) {
            try {
                await addComment({
                    postid: post.id,
                    comment: { content, id: nanoid() }
                }).unwrap();
            } catch(err) {
                console.error("Unable to add comment: ", err.message);
            } finally {
                setContent("");
            };
        };
    };

    return (
        <div>
            <Link to={`/share/${bedid}/bulletin`}>Return to bulletin</Link>
            <h1>{post?.title}</h1>
            <p>{`Posted on ${post?.posted.toString().slice(0, 10)} by ${post?.authorname}`}</p>
            <p>{`${post?.content}`}</p>
            <div>
                <button type="button" onClick={() => updateReaction("like")}>{post?.likes.includes(user.id) ? "Unlike this post" : "Like this post"}</button>
                <p>{post?.likes.length}</p>
                <button type="button" onClick={() => updateReaction("dislike")}>{post?.dislikes.includes(user.id) ? "Un-dislike this post" : "Dislike this post"}</button>
                <p>{post?.dislikes.length}</p>
            </div>
            <button type="button" onClick={() => setAddCommentVis(!addCommentVis)}>Add comment</button>

            {addCommentVis ?
                <form method="POST" onSubmit={postComment}>
                    <label htmlFor="content" />
                    <textarea name="content" id="content" cols={30} rows={10} value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                    <button type="submit">Post</button>
                </form> : null
            }
        </div>
    );
};

export default Post;

