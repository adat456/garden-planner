import { useState } from "react";
import { useParams } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";
import { useAddPostMutation } from "../../app/apiSlice";

interface newPostInterface {
    setNewPostVis: React.Dispatch<React.SetStateAction<boolean>>
};

const NewPost: React.FC<newPostInterface> = function({ setNewPostVis }) {
    const [ title, setTitle ] = useState("");
    const [ content, setContent ] = useState("");

    const { bedid } = useParams();
    const [ addPost, { isLoading } ] = useAddPostMutation();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!isLoading && title && content) {
            try {
                await addPost({
                    bedid,
                    post: { title, content, id: nanoid() }
                });
            } catch(err) {
                console.error("Unable to add post: ", err.message);
            } finally {
                handleClose();
            };
        };
    };

    async function handleClose() {
        const newPostForm: HTMLDialogElement | null = document.querySelector(".new-post-form");
        newPostForm?.close();
        setNewPostVis(false);
    };

    return (
        <dialog className="new-post-form">
            <form method="POST" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title</label>
                    <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="content">Body</label>
                    <textarea name="content" id="content" cols={30} rows={10} value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                </div>
                <button type="button" onClick={handleClose}>Close</button>
                <button type="submit">Post to bulletin</button>
            </form>
        </dialog>
    )
};

export default NewPost;