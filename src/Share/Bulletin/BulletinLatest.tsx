import { useMemo, useState, useEffect } from "react";
import { Link, useParams} from "react-router-dom";
import { useGetPostsQuery } from "../../app/apiSlice";
import { postInterface } from "../../app/interfaces";
import PostPreview from "./PostPreview";
import AddEditPost from "./AddEditPost";

const BulletinLatest: React.FC = function() {
    const [ AddEditPostVis, setAddEditPostVis ] = useState(false);

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
        if (AddEditPostVis) {
            const AddEditPostForm: HTMLDialogElement | null = document.querySelector(".new-post-form");
            AddEditPostForm?.showModal();
        }
    }, [AddEditPostVis]);

    return (
        <>
            <section>
                <h2>Bulletin</h2>
                <ul>
                    {generateLatestPosts()}
                </ul>
                <button type="button" onClick={() => setAddEditPostVis(true)}>Add new post</button>
                <Link to={`/share/${bedid}/bulletin`}>See all bulletin posts and announcements</Link>
            </section>
            {AddEditPostVis ? <AddEditPost setAddEditPostVis={setAddEditPostVis} /> : null}
        </>
    );
};

export default BulletinLatest;