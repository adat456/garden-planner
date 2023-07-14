import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetUserQuery } from "../../app/apiSlice";
import { postInterface, userInterface } from "../../app/interfaces";

interface individualPostInterface {
    post: postInterface
};

const PostPreview: React.FC<individualPostInterface> = function({ post }) {
    const { bedid } = useParams();

    const { data } = useGetUserQuery(undefined);
    const user = data as userInterface;
    
    return (
        <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{`Posted on ${post.posted.toString().slice(0, 10)} by ${post.authorname}`}</p>
            <p>{`${post.content.slice(0, 150)}${post.content.length > 150 ? "..." : ""}`}</p>
            <div>
                <button type="button">{post.likes.includes(user.id) ? "Unlike this post" : "Like this post"}</button>
                <p>{post.likes.length}</p>
                <button type="button">{post.dislikes.includes(user.id) ? "Un-dislike this post" : "Dislike this post"}</button>
                <p>{post.dislikes.length}</p>
            </div>
            <Link to={`/share/${bedid}/bulletin/${post.id}`}>See entire post</Link>
        </li>
    );
};

export default PostPreview;