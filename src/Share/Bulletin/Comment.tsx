import { useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { commentInterface, userInterface } from "../../app/interfaces";
import { useGetUserQuery, useUpdateReactionsMutation, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "../../app/apiSlice";

const Comment: React.FC<{comment: commentInterface}> = function({ comment }) {
    const [ likes, setLikes ] = useState(comment.likes);
    const [ dislikes, setDislikes ] = useState(comment.dislikes);
    const [ updateCommentVis, setUpdateCommentVis ] = useState(false);
    const [ updateCommentContent, setUpdateCommentContent ] = useState(comment.content);
    const [ addCommentVis, setAddCommentVis ] = useState(false);
    const [ addCommentContent, setAddCommentContent ] = useState("");

    const { data } = useGetUserQuery(undefined);
    const user = data as userInterface;

    const [ addComment, { isLoading: addCommentIsLoading } ] = useAddCommentMutation();
    const [ updateComment, { isLoading: updateCommentIsLoading } ]  = useUpdateCommentMutation();
    const [ deleteComment, { isLoading: deleteCommentIsLoading } ]  = useDeleteCommentMutation();

    // opted against making this an rtk mutation in favor of manually sending PATCH requests
    async function handleUpdateReactions(type: string) {
        if (type === "like") {
            try {
                let updatedLikes: number[] = [];
                if (likes.includes(user?.id)) {
                    updatedLikes = likes.filter(id => id !== user.id);
                } else {
                    updatedLikes = [...likes, user.id]
                };

                const reqOptions: RequestInist = {
                    method: "PATCH",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ likes: updatedLikes }),
                    credentials: "include"
                }
                const req = await fetch(`http://localhost:3000/update-reactions/comments/${comment.id}`, reqOptions);
                if (req.ok) setLikes(updatedLikes);

            } catch(err) {
                console.error("Unable to update likes: ", err.message);
            };
        };

        if (type === "dislike") {
            try {
                let updatedDislikes: number[] = [];
                if (dislikes.includes(user?.id)) {
                    updatedDislikes = dislikes.filter(id => id !== user.id);
                } else {
                    updatedDislikes = [...dislikes, user.id]
                };

                const reqOptions: RequestInist = {
                    method: "PATCH",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dislikes: updatedDislikes }),
                    credentials: "include"
                }
                const req = await fetch(`http://localhost:3000/update-reactions/comments/${comment.id}`, reqOptions);
                if (req.ok) setDislikes(updatedDislikes);
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
                        <button type="button" onClick={() => handleUpdateReactions("like")}>{likes.includes(user.id) ? "Unlike this comment" : "Like this comment"}</button>
                        <p>{likes.length}</p>
                        <button type="button" onClick={() => handleUpdateReactions("dislike")}>{dislikes.includes(user.id) ? "Un-dislike this comment" : "Dislike this comment"}</button>
                        <p>{dislikes.length}</p>
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