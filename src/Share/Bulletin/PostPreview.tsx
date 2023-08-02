import { useParams, Link } from "react-router-dom";
import { useGetUserQuery, useGetPersonalPermissionsQuery, useUpdatePostMutation, useUpdateReactionsMutation } from "../../app/apiSlice";
import { postInterface, userInterface } from "../../app/interfaces";
import { useWrapRTKMutation, useWrapRTKQuery } from "../../app/customHooks";

interface individualPostInterface {
    post: postInterface
};

const PostPreview: React.FC<individualPostInterface> = function({ post }) {
    const { bedid } = useParams();

    const { data } = useWrapRTKQuery(useGetUserQuery);
    const user = data as userInterface;
    const { data: permissionsData } = useWrapRTKQuery(useGetPersonalPermissionsQuery, bedid);
    const personalPermissions = permissionsData as string[];

    const { mutation: updatePost, isLoading: updatePostIsLoading } = useWrapRTKMutation(useUpdatePostMutation);
    const { mutation: updateReactions, isLoading: updateReactionsIsLoading } = useWrapRTKMutation(useUpdateReactionsMutation);

    async function togglePinned() {
        if (!updatePostIsLoading) {
            try {
                await updatePost({
                    bedid,
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
                    bedid,
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
                    bedid,
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
    
    return (
        <li key={post.id}>
            {personalPermissions?.includes("fullpermissions") ?
                <button type="button" onClick={togglePinned}>{post?.pinned ? "Unpin" : "Pin"}</button> 
                : null
            }
            <h3>{post.title}</h3>
            <p>{`Posted on ${post.posted.toString().slice(0, 10)} by ${post.authorname}`}</p>
            <p>{`${post.content.slice(0, 150)}${post.content.length > 150 ? "..." : ""}`}</p>
            <div>
                {personalPermissions?.includes("fullpermissions") || personalPermissions?.includes("postinteractionspermission") ?
                    <>
                        <button type="button" onClick={() => updateReaction("like")}>{post?.likes.includes(user?.id) ? "Unlike this post" : "Like this post"}</button>
                        <p>{post.likes.length}</p>
                        <button type="button" onClick={() => updateReaction("dislike")}>{post?.dislikes.includes(user?.id) ? "Un-dislike this post" : "Dislike this post"}</button>
                        <p>{post.dislikes.length}</p>
                    </> :
                    <>
                        <p>{post.likes.length}</p>
                        <p>{post.dislikes.length}</p>
                    </>
                } 
            </div>
            <Link to={`/share/${bedid}/bulletin/${post.id}`}>See entire post</Link>
        </li>
    );
};

export default PostPreview;