import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useGetPostsQuery } from "../../app/apiSlice";
import { postInterface } from "../../app/interfaces";
import PostPreview from "./PostPreview";
import NewPost from "./NewPost";

const Bulletin: React.FC = function() {
    const [ newPostVis, setNewPostVis ] = useState(false);

    const { bedid } = useParams();

    const { data } = useGetPostsQuery(bedid);
    const posts = data as postInterface[];
    const sortedLatestPosts = useMemo(() => {
        const sortedPosts = posts?.slice();
        sortedPosts?.sort((a, b) => {
            return new Date(a.posted) - new Date(b.posted);
        });
        return sortedPosts;
    }, [posts]);

    function generatePosts() {
        const posts = sortedLatestPosts?.map(post => <PostPreview key={post.id} post={post} />);
        return posts;
    };

    useEffect(() => {
        if (newPostVis) {
            const newPostForm: HTMLDialogElement | null = document.querySelector(".new-post-form");
            newPostForm?.showModal();
        }
    }, [newPostVis]);

    return (
        <>
            <div>
                <Link to={`/share/${bedid}`}>Return to bed overview</Link>
                <h1>Bulletin</h1>
                <ul>
                    {generatePosts()}
                </ul>
                <button type="button" onClick={() => setNewPostVis(true)}>Add new post</button>
            </div>
            {newPostVis ? <NewPost setNewPostVis={setNewPostVis} /> : null}
        </>
    )
};

export default Bulletin;