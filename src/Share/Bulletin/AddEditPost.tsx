import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";
import { useAddPostMutation, useUpdatePostMutation, useDeletePostMutation } from "../../app/apiSlice";
import { postInterface } from "../../app/interfaces";
import { validatePostInput } from "../../app/helpers";

interface newPostInterface {
    setAddEditPostVis: React.Dispatch<React.SetStateAction<boolean>>,
    post?: postInterface
};

const NewPost: React.FC<newPostInterface> = function({ setAddEditPostVis, post }) {
    const [ title, setTitle ] = useState(post?.title || "");
    const [ titleErrMsg, setTitleErrMsg ] = useState("");
    const [ content, setContent ] = useState(post?.content || "");
    const [ contentErrMsg, setContentErrMsg ] = useState("");
    const [ pinned, setPinned ] = useState(post?.pinned || false);
    const [ confirmDeleteVis, setConfirmDeleteVis ] = useState(false);

    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const navigate = useNavigate();
    const { bedid } = useParams();
    const [ addPost, { isLoading: addPostIsLoading } ] = useAddPostMutation();
    const [ updatePost, { isLoading: updatePostIsLoading } ] = useUpdatePostMutation();
    const [ deletePost, { isLoading: deletePostIsLoading } ] = useDeletePostMutation();

    async function handleAddNewPost(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!addPostIsLoading) {
            // validation takes place both before adding/updating posts, and whenever the input changes (see onChange event handlers)
            validatePostInput(titleRef?.current, 50, setTitleErrMsg);
            validatePostInput(contentRef?.current, 500, setContentErrMsg);
            // if anything in the form is invalid, exit this function
            if (!formRef?.current?.checkValidity()) return;

            const id = nanoid();
            try {
                await addPost({
                    bedid,
                    post: { title, content, pinned, id }
                }).unwrap();

                navigate(`/share/${bedid}/bulletin/${id}`);
                handleClose();
            } catch(err) {
                console.error("Unable to add post: ", err.data);
                if (err.data instanceof Array) displayExpressValidatorErrMsgs(err.data);
            };
        };
    };

    async function handleUpdateExistingPost(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!updatePostIsLoading) {
            validatePostInput(titleRef?.current, 50, setTitleErrMsg);
            validatePostInput(contentRef?.current, 500, setContentErrMsg);
            if (!formRef?.current?.checkValidity()) return;

            try {
                await updatePost({
                    postid: post?.id,
                    content: { title, content, pinned }
                }).unwrap();

                handleClose();
            } catch(err) {
                console.error("Unable to update comment: ", err.data);
                if (err.data instanceof Array) displayExpressValidatorErrMsgs(err.data);
            };
        };
    };

    function displayExpressValidatorErrMsgs(errorArr: {field: string, msg: string}[]) {
        errorArr.forEach(error => {
            if (error.field === "title") {
                setTitleErrMsg(error.msg);
                titleRef.current?.setCustomValidity(error.msg);
            };
            if (error.field === "content") {
                setContentErrMsg(error.msg);
                contentRef.current?.setCustomValidity(error.msg);
            };
        });
    };

    async function handleDeletePost() {
        if (!deletePostIsLoading) {
            try {
                await deletePost(post?.id).unwrap();

                navigate(`/share/${bedid}/bulletin`)
                handleClose();
            } catch(err) {
                console.error("Unable to delete comment: ", err.data);
            };
        };
    };

    async function handleClose() {
        const addEditPostForm: HTMLDialogElement | null = document.querySelector(".add-edit-post-form");
        addEditPostForm?.close();
        setAddEditPostVis(false);
    };

    return (
        <dialog className="new-post-form add-edit-post-form">
            <form method="POST" ref={formRef} onSubmit={!post ? handleAddNewPost : handleUpdateExistingPost} noValidate>
                <div>
                    <label htmlFor="title">Title*</label>
                    {titleErrMsg ? 
                        <div className="error-msg">
                            <p>{titleErrMsg}</p> 
                        </div>
                        : null
                    }
                    <input type="text" name="title" id="title" maxLength={50} ref={titleRef} value={title} onChange={(e) => {setTitle(e.target.value); validatePostInput(titleRef?.current, 50, setTitleErrMsg);}} required />
                </div>
                <div>
                    <label htmlFor="content">Body*</label>
                    {contentErrMsg ? 
                        <div className="error-msg">
                            <p>{contentErrMsg}</p> 
                        </div>
                        : null
                    }
                    <textarea name="content" id="content" maxLength={500} cols={30} rows={10} ref={contentRef} value={content} onChange={(e) => {setContent(e.target.value); validatePostInput(contentRef?.current, 500, setContentErrMsg);}} required></textarea>
                </div>
                <div>
                    <input type="checkbox" name="pinned" id="pinned" checked={pinned} onChange={() => setPinned(!pinned)} />
                    <label htmlFor="pinned">Pin this post to top of bulletin</label>
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