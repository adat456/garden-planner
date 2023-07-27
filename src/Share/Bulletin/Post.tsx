import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";
import { useGetPostsQuery, useGetUserQuery, useGetCommentsQuery, useUpdatePostMutation, useUpdateReactionsMutation, useAddCommentMutation } from "../../app/apiSlice";
import { useWrapRTKMutation, useWrapRTKQuery } from "../../app/customHooks";
import { postInterface, commentInterface, commentTreeInterface, userInterface } from "../../app/interfaces";
import { validateRequiredInputLength } from "../../app/helpers";
import Comment from "./Comment";
import AddEditPost from "./AddEditPost";

const Post: React.FC = function() {
    const [ addCommentVis, setAddCommentVis ] = useState(false);
    const [ content, setContent ] = useState("");
    const [ contentErrMsg, setContentErrMsg ] = useState("");
    const [ addEditPostVis, setAddEditPostVis ] = useState(false);

    const { bedid, postid } = useParams();

    const contentRef = useRef<HTMLInputElement>(null);
    const addCommentFormRef = useRef<HTMLFormElement>(null);

    const { data: postObject } = useWrapRTKQuery(useGetPostsQuery, bedid);
    const post = postObject.find(post => post?.id === postid) as postInterface;
    const { data: userData } = useWrapRTKQuery(useGetUserQuery);
    const user = userData as userInterface;
    const { data: commentsData, isLoading } = useWrapRTKQuery(useGetCommentsQuery, post?.id);
    const comments = commentsData as commentTreeInterface[];

    const { mutation: updatePost, isLoading: updatePostIsLoading } = useWrapRTKMutation(useUpdatePostMutation);
    const { mutation: updateReactions, isLoading: updateReactionsIsLoading } = useWrapRTKMutation(useUpdateReactionsMutation);
    const { mutation: addComment, isLoading: addCommentIsLoading } = useWrapRTKMutation(useAddCommentMutation);

    function generateComments() {
        let generatedComments = comments?.map(comment => (
            <div key={comment.id}>
                <p>{`Level ${comment.level}`}</p>
                <Comment key={comment.id} comment={comment} />
                <hr />
            </div>
        ));
        return generatedComments;
    };

    async function togglePinned() {
        if (!updatePostIsLoading) {
            try {
                await updatePost({
                    postid: post?.id,
                    content: {
                        title: post?.title,
                        content: post?.content,
                        pinned: !post?.pinned
                    },
                }).unwrap();
            } catch(err) {
                console.error("Unable to toggle pinning of this post: ", err.data);
            };
        };
    };

    async function postComment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!addCommentIsLoading) {
            validateRequiredInputLength(contentRef?.current, 500, setContentErrMsg);
            if (!addCommentFormRef.current?.checkValidity()) return;

            try {
                await addComment({
                    postid: post.id,
                    comment: { content, id: nanoid() }
                }).unwrap();

                setContent("");
                setAddCommentVis(false);
            } catch(err) {
                console.error("Unable to add comment: ", err.data);
                if (err.data instanceof Array) displayExpressValidatorErrMsgs(err.data);
            };
        };
    };

    function displayExpressValidatorErrMsgs(errorArr: {field: string, msg: string}[]) {
        errorArr.forEach(error => {
            if (error.field === "content") {
                setContentErrMsg(error.msg);
                contentRef.current?.setCustomValidity(error.msg);
            };
        });
    };

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
                console.error("Unable to update likes: ", err.data);
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
                console.error("Unable to update dislikes: ", err.data);
            };
        };
    };

    useEffect(() => {
        if (addEditPostVis) {
            const addEditPost: HTMLDialogElement | null = document.querySelector(".add-edit-post-form");
            addEditPost?.showModal();
        };
    }, [addEditPostVis]);

    return (
        <>
            <div>
                <Link to={`/share/${bedid}/bulletin`}>Return to bulletin</Link>
                <h1>{post?.title}</h1>
                {user?.id === post?.authorid ?
                    <>
                        <button type="button" onClick={() => setAddEditPostVis(true)}>Edit post</button>
                        <button type="button" onClick={togglePinned}>{post?.pinned ? "Unpin" : "Pin"}</button>
                    </>
                    : null
                }
                <p>{`Posted on ${post?.posted.toString().slice(0, 10)} by ${post?.authorname}`}</p>
                <p>{`${post?.content}`}</p>
                <div>
                    <button type="button" onClick={() => updateReaction("like")}>{post?.likes.includes(user?.id) ? "Unlike this post" : "Like this post"}</button>
                    <p>{post?.likes.length}</p>
                    <button type="button" onClick={() => updateReaction("dislike")}>{post?.dislikes.includes(user?.id) ? "Un-dislike this post" : "Dislike this post"}</button>
                    <p>{post?.dislikes.length}</p>
                </div>
                <hr />
                <section>
                    <h2>Comments</h2>
                    {isLoading ? 
                        <p>Loading comments...</p> :
                        generateComments()
                    }
                </section>
                <button type="button" onClick={() => setAddCommentVis(!addCommentVis)}>Add comment</button>

                {addCommentVis ?
                    <form method="POST" ref={addCommentFormRef} onSubmit={postComment} noValidate>
                        <label htmlFor="content" />
                        {contentErrMsg ? 
                            <div className="error-msg">
                                <p>{contentErrMsg}</p> 
                            </div>
                            : null
                        }
                        <textarea name="content" id="content" ref={contentRef} maxLength={500} cols={30} rows={10} value={content} onChange={(e) => {setContent(e.target.value); validateRequiredInputLength(contentRef?.current, 500, setContentErrMsg);}} required></textarea>
                        <button type="submit">Post</button>
                    </form> : null
                }
            </div>
            <AddEditPost setAddEditPostVis={setAddEditPostVis} post={post} />
        </>
    );
};

export default Post;

