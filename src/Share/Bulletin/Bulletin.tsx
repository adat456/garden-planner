import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useGetPostsQuery } from "../../app/apiSlice";
import { postInterface } from "../../app/interfaces";
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
        const posts = sortedLatestPosts?.map(post => (
            <li key={post.id}>
                <h3>{post.title}</h3>
                <p>{`Posted on ${post.posted.toString().slice(0, 10)} by ${post.authorname}`}</p>
                <p>{`${post.content.slice(0, 150)}${post.content.length > 150 ? "..." : ""}`}</p>
            </li>
        ));
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