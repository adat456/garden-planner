import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";
import { commentInterface, userInterface } from "../../app/interfaces";
import { useGetUserQuery, useGetPersonalPermissionsQuery, useAddCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "../../app/apiSlice";
import { useWrapRTKMutation, useWrapRTKQuery } from "../../app/customHooks";
import { validateRequiredInputLength } from "../../app/helpers";

const Comment: React.FC<{comment: commentInterface, toppostid: text}> = function({ comment, toppostid }) {
    const [ likes, setLikes ] = useState(comment.likes);
    const [ dislikes, setDislikes ] = useState(comment.dislikes);
    const [ updateCommentVis, setUpdateCommentVis ] = useState(false);
    const [ updateCommentContent, setUpdateCommentContent ] = useState(comment.content);
    const [ updateCommentErrMsg, setUpdateCommentErrMsg ] = useState("");
    const [ addCommentVis, setAddCommentVis ] = useState(false);
    const [ addCommentContent, setAddCommentContent ] = useState("");
    const [ addCommentErrMsg, setAddCommentErrMsg ] = useState("");

    const updateCommentInputRef = useRef<HTMLInputElement>(null);
    const updateCommentFormRef = useRef<HTMLFormElement>(null);
    const addCommentInputRef = useRef<HTMLInputElement>(null);
    const addCommentFormRef = useRef<HTMLFormElement>(null);

    const { bedid } = useParams();

    const { data } = useWrapRTKQuery(useGetUserQuery);
    const user = data as userInterface;
    const { data: permissionsData } = useWrapRTKQuery(useGetPersonalPermissionsQuery, bedid);
    const personalPermissions = permissionsData as string[];

    const { mutation: addComment, isLoading: addCommentIsLoading } = useWrapRTKMutation(useAddCommentMutation);
    const { mutation: updateComment, isLoading: updateCommentIsLoading } = useWrapRTKMutation(useUpdateCommentMutation);
    const { mutation: deleteComment, isLoading: deleteCommentIsLoading } = useWrapRTKMutation(useDeleteCommentMutation);

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
                const req = await fetch(`http://localhost:3000/update-reactions/${bedid}/comments/${comment.id}`, reqOptions);
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

                const reqOptions: RequestInit = {
                    method: "PATCH",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dislikes: updatedDislikes }),
                    credentials: "include"
                }
                const req = await fetch(`http://localhost:3000/update-reactions/${bedid}/comments/${comment.id}`, reqOptions);
                if (req.ok) setDislikes(updatedDislikes);
            } catch(err) {
                console.error("Unable to update dislikes: ", err.message);
            };
        };
    };

    async function handleUpdateComment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!updateCommentIsLoading) {
            validateRequiredInputLength(updateCommentInputRef?.current, 500, setUpdateCommentErrMsg);
            if (!updateCommentFormRef.current?.checkValidity()) return;

            try {
                await updateComment({
                    bedid,
                    commentid: comment.id,
                    content: { content: updateCommentContent }
                }).unwrap();

                setUpdateCommentContent("");
                setUpdateCommentVis(false);
            } catch(err) {
                console.error("Unable to update comment: ", err.message);
                if (err.data instanceof Array) displayExpressValidatorErrMsgs(err.data, "updateComment");
            };
        };
    };

    async function handleDeleteComment() {
        if (!deleteCommentIsLoading) {
            try {
                await deleteComment({
                    bedid,
                    commentid: comment.id
                }).unwrap();
            } catch(err) {
                console.error("Unable to delete comment: ", err.message);
            };
        };
    };

    async function handleAddComment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!addCommentIsLoading) {
            validateRequiredInputLength(addCommentInputRef?.current, 500, setAddCommentErrMsg);
            if (!addCommentFormRef.current?.checkValidity()) return;

            try {
                await addComment({
                    bedid,
                    postid: comment.id,
                    comment: { content: addCommentContent, commentid: nanoid(), toppostid }
                }).unwrap();

                setAddCommentContent("");
                setAddCommentVis(false);
            } catch(err) {
                console.error("Unable to add comment: ", err.data);
                if (err.data instanceof Array) displayExpressValidatorErrMsgs(err.data, "addComment");
            };
        };
    };

    function displayExpressValidatorErrMsgs(errorArr: {field: string, msg: string}[], field: string) {
        errorArr.forEach(error => {
            if (field === "updateComment") {
                setUpdateCommentErrMsg(error.msg);
                updateCommentInputRef.current?.setCustomValidity(error.msg);
            };
            if (field === "addComment") {
                setAddCommentErrMsg(error.msg);
                addCommentInputRef.current?.setCustomValidity(error.msg);
            };
        });
    };

    return (
        <div id={`comment-${comment.id}`}>
            {(personalPermissions?.includes("fullpermissions") || personalPermissions?.includes("postinteractionspermission")) && comment?.authorid === user?.id ?
                <button type="button" onClick={() => setUpdateCommentVis(!updateCommentVis)}>Edit comment</button>  :
                null
            }

            {!updateCommentVis ?
                <>
                    <p>{comment.content}</p>
                    <p>{`Posted on ${comment.posted.toString().slice(0, 10)} by ${comment.authorname}`}</p>
                    <div>
                        {personalPermissions?.includes("fullpermissions") || personalPermissions?.includes("postinteractionspermission") ?
                            <>
                                <button type="button" onClick={() => handleUpdateReactions("like")}>{likes.includes(user?.id) ? "Unlike this comment" : "Like this comment"}</button>
                                <p>{likes.length}</p>
                                <button type="button" onClick={() => handleUpdateReactions("dislike")}>{dislikes.includes(user?.id) ? "Un-dislike this comment" : "Dislike this comment"}</button>
                                <p>{dislikes.length}</p>
                            </> : 
                            <>  
                                <p>{likes.length}</p>
                                <p>{dislikes.length}</p>
                            </>
                        }
                    </div>
                    {personalPermissions?.includes("postinteractionspermission") ?
                        <button type="button" onClick={() => setAddCommentVis(!addCommentVis)}>Add comment</button> : null
                    }

                    {addCommentVis ?
                        <form method="POST" ref={addCommentFormRef} onSubmit={handleAddComment} noValidate>
                            <label htmlFor="content" />
                            {addCommentErrMsg ? 
                                <div className="error-msg">
                                    <p>{addCommentErrMsg}</p> 
                                </div>
                                : null
                            }
                            <textarea name="content" id="content" ref={addCommentInputRef} maxLength={500} cols={30} rows={10} value={addCommentContent} onChange={(e) => {setAddCommentContent(e.target.value); validateRequiredInputLength(addCommentInputRef?.current, 500, setAddCommentErrMsg);}} required />
                            <button type="submit">Post</button>
                        </form> : 
                        null
                    }
                </> :
                <form method="POST" ref={updateCommentFormRef} onSubmit={handleUpdateComment} noValidate>
                    <label htmlFor="content" />
                    {updateCommentErrMsg ? 
                        <div className="error-msg">
                            <p>{updateCommentErrMsg}</p> 
                        </div>
                        : null
                    }
                    <textarea name="content" id="content" ref={updateCommentInputRef} maxLength={500} cols={30} rows={10} value={updateCommentContent} onChange={(e) => {setUpdateCommentContent(e.target.value); validateRequiredInputLength(updateCommentInputRef?.current, 500, setUpdateCommentErrMsg);}} required />
                    <button type="submit">Update</button>
                    <button type="button" onClick={handleDeleteComment}>Delete</button>
                </form> 
            }
        </div>
    )
};

export default Comment;