import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";
import { useAddPostMutation, useUpdatePostMutation, useDeletePostMutation } from "../../app/apiSlice";
import { postInterface } from "../../app/interfaces";

interface newPostInterface {
    setAddEditPostVis: React.Dispatch<React.SetStateAction<boolean>>,
    post?: postInterface
};

const NewPost: React.FC<newPostInterface> = function({ setAddEditPostVis, post }) {
    const [ title, setTitle ] = useState(post?.title || "");
    const [ content, setContent ] = useState(post?.content || "");
    const [ confirmDeleteVis, setConfirmDeleteVis ] = useState(false);

    const navigate = useNavigate();
    const { bedid } = useParams();
    const [ addPost, { isLoading: addPostIsLoading } ] = useAddPostMutation();
    const [ updatePost, { isLoading: updatePostIsLoading } ] = useUpdatePostMutation();
    const [ deletePost, { isLoading: deletePostIsLoading } ] = useDeletePostMutation();

    async function handleAddNewPost(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!addPostIsLoading && title && content) {
            const id = nanoid();
            try {
                await addPost({
                    bedid,
                    post: { title, content, id }
                });
            } catch(err) {
                console.error("Unable to add post: ", err.message);
            } finally {
                navigate(`/share/${bedid}/bulletin/${id}`);
                handleClose();
            };
        };
    };

    async function handleUpdateExistingPost(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (title && content && !updatePostIsLoading) {
            try {
                await updatePost({
                    postid: post?.id,
                    content: { title, content }
                }).unwrap();
            } catch(err) {
                console.error("Unable to update comment: ", err.message);
            } finally {
                handleClose();
            };
        };
    };

    async function handleDeletePost() {
        if (!deletePostIsLoading) {
            try {
                await deletePost(post?.id).unwrap();
            } catch(err) {
                console.error("Unable to delete comment: ", err.message);
            } finally {
                navigate(`/share/${bedid}/bulletin`)
                handleClose();
            };
        };
    };

    async function handleClose() {
        const newPostForm: HTMLDialogElement | null = document.querySelector(".new-post-form");
        newPostForm?.close();
        setAddEditPostVis(false);
    };

    return (
        <dialog className="new-post-form add-edit-post-form">
            <form method="POST" onSubmit={!post ? handleAddNewPost : handleUpdateExistingPost}>
                <div>
                    <label htmlFor="title">Title</label>
                    <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="content">Body</label>
                    <textarea name="content" id="content" cols={30} rows={10} value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                </div>
                <button type="button" onClick={handleClose}>Close</button>
                {!post ?
                    <button type="submit">Post to bulletin</button> :
                    <>
                        <button type="submit">Submit updates</button>
                        <button type="button" onClick={() => setConfirmDeleteVis(true)}>Delete</button>
                        {confirmDeleteVis ?
                            <div>
                                <p>Are you sure you want to delete this post and all of its comments permanently?</p>
                                <button type="button" onClick={handleDeletePost}>Confirm delete</button>
                                <button type="button" onClick={() => setConfirmDeleteVis(false)}>Cancel</button>
                            </div>
                            : null
                        }
                    </>
                }
    
            </form>
        </dialog>
    )
};

export default NewPost;