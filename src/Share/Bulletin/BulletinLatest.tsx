import { useMemo, useState, useEffect } from "react";
import { Link, useParams} from "react-router-dom";
import { useGetPostsQuery } from "../../app/apiSlice";
import { postInterface } from "../../app/interfaces";
import PostPreview from "./PostPreview";
import NewPost from "./NewPost";

const BulletinLatest: React.FC = function() {
    const [ newPostVis, setNewPostVis ] = useState(false);

    const { bedid } = useParams();

    const { data } = useGetPostsQuery(bedid);
    const posts = data as postInterface[];
    const sortedLatestPosts = useMemo(() => {
        const sortedPosts = posts?.slice();
        sortedPosts?.sort((a, b) => {
            return new Date(a.posted) - new Date(b.posted);
        });
        const firstFivePosts = sortedPosts?.slice(0, 5);
        return firstFivePosts;
    }, [posts]);

    function generateLatestPosts() {
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
            <section>
                <h2>Bulletin</h2>
                <ul>
                    {generateLatestPosts()}
                </ul>
                <button type="button" onClick={() => setNewPostVis(true)}>Add new post</button>
                <Link to={`/share/${bedid}/bulletin`}>See all bulletin posts and announcements</Link>
            </section>
            {newPostVis ? <NewPost setNewPostVis={setNewPostVis} /> : null}
        </>
    );
};

export default BulletinLatest;