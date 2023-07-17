import { useParams, Link } from "react-router-dom";
import { useGetUserQuery, useUpdatePostMutation } from "../../app/apiSlice";
import { postInterface, userInterface } from "../../app/interfaces";

interface individualPostInterface {
    post: postInterface
};

const PostPreview: React.FC<individualPostInterface> = function({ post }) {
    const { bedid } = useParams();

    const { data } = useGetUserQuery(undefined);
    const user = data as userInterface;

    const [ updatePost, { isLoading: updatePostIsLoading } ] = useUpdatePostMutation();

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
                console.error("Unable to toggle pinning of this post: ", err.message);
            };
        };
    };
    
    return (
        <li key={post.id}>
            <button type="button" onClick={togglePinned}>{post?.pinned ? "Unpin" : "Pin"}</button>
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