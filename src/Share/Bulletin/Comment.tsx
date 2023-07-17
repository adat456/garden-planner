import { useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { commentInterface, userInterface } from "../../app/interfaces";
import { useGetUserQuery, useUpdateReactionsMutation, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "../../app/apiSlice";

const Comment: React.FC<{comment: commentInterface}> = function({ comment }) {
    const [ updateCommentVis, setUpdateCommentVis ] = useState(false);
    const [ updateCommentContent, setUpdateCommentContent ] = useState(comment.content);
    const [ addCommentVis, setAddCommentVis ] = useState(false);
    const [ addCommentContent, setAddCommentContent ] = useState("");

    const { data } = useGetUserQuery(undefined);
    const user = data as userInterface;

    const [ updateReactions, { isLoading: updateReactionsIsLoading } ] = useUpdateReactionsMutation();
    const [ addComment, { isLoading: addCommentIsLoading } ] = useAddCommentMutation();
    const [ updateComment, { isLoading: updateCommentIsLoading } ]  = useUpdateCommentMutation();
    const [ deleteComment, { isLoading: deleteCommentIsLoading } ]  = useDeleteCommentMutation();

    async function updateReaction(type: string) {
        if (type === "like" && !updateReactionsIsLoading) {
            try {
                let updatedLikes: number[] = [];
                if (comment.likes.includes(user?.id)) {
                    updatedLikes = comment.likes.filter(id => id !== user.id);
                } else {
                    updatedLikes = [...comment.likes, user.id]
                };

                await updateReactions({
                    table: "comments",
                    id: comment.id,
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
                if (comment?.dislikes.includes(user?.id)) {
                    updatedDislikes = comment.dislikes.filter(id => id !== user.id);
                } else {
                    updatedDislikes = [...comment.dislikes, user.id]
                };

                await updateReactions({
                    table: "comments",
                    id: comment.id,
                    reaction: {
                        dislikes: updatedDislikes
                    }
                }).unwrap();
            } catch(err) {
                console.error("Unable to update dislikes: ", err.message);
            };
        };
    };

    async function handleUpdateComment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (updateCommentContent && !updateCommentIsLoading) {
            try {
                await updateComment({
                    commentid: comment.id,
                    content: { content: updateCommentContent }
                }).unwrap();
            } catch(err) {
                console.error("Unable to update comment: ", err.message);
            } finally {
                setUpdateCommentContent("");
                setUpdateCommentVis(false);
            };
        };
    };

    async function handleDeleteComment() {
        if (!deleteCommentIsLoading) {
            try {
                await deleteComment(comment.id).unwrap();
            } catch(err) {
                console.error("Unable to delete comment: ", err.message);
            };
        };
    };

    async function handleAddComment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (addCommentContent && !addCommentIsLoading) {
            try {
                await addComment({
                    postid: comment.id,
                    comment: { content: addCommentContent, id: nanoid() }
                }).unwrap();
            } catch(err) {
                console.error("Unable to add comment: ", err.message);
            } finally {
                setAddCommentContent("");
                setAddCommentVis(false);
            };
        };
    };

    return (
        <div>
            {user?.id === comment.authorid ?
                <button type="button" onClick={() => setUpdateCommentVis(!updateCommentVis)}>Edit comment</button> : 
                null
            }

            {!updateCommentVis ?
                <>
                    <p>{comment.content}</p>
                    <p>{`Posted on ${comment.posted.toString().slice(0, 10)} by ${comment.authorname}`}</p>
                    <div>
                        <button type="button" onClick={() => updateReaction("like")}>{comment.likes.includes(user.id) ? "Unlike this comment" : "Like this comment"}</button>
                        <p>{comment.likes.length}</p>
                        <button type="button" onClick={() => updateReaction("dislike")}>{comment.dislikes.includes(user.id) ? "Un-dislike this comment" : "Dislike this comment"}</button>
                        <p>{comment.dislikes.length}</p>
                    </div>
                    <button type="button" onClick={() => setAddCommentVis(!addCommentVis)}>Add comment</button>

                    {addCommentVis ?
                        <form method="POST" onSubmit={handleAddComment}>
                            <label htmlFor="content" />
                            <textarea name="content" id="content" cols={30} rows={10} value={addCommentContent} onChange={(e) => setAddCommentContent(e.target.value)}></textarea>
                            <button type="submit">Post</button>
                        </form> : 
                        null
                    }
                </> :
                <form method="POST" onSubmit={handleUpdateComment}>
                    <label htmlFor="content" />
                    <textarea name="content" id="content" cols={30} rows={10} value={updateCommentContent} onChange={(e) => setUpdateCommentContent(e.target.value)}></textarea>
                    <button type="submit">Update</button>
                    <button type="button" onClick={handleDeleteComment}>Delete</button>
                </form> 
            }
        </div>
    )
};

export default Comment;