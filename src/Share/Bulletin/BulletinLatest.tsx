import { Link, useParams} from "react-router-dom";
import { useGetPostsQuery } from "../../app/apiSlice";
import { useWrapRTKQuery } from "../../app/customHooks";
import { postInterface } from "../../app/interfaces";
import PostPreview from "./PostPreview";

const BulletinLatest: React.FC = function() {
    const { bedid } = useParams();

    const { data } = useWrapRTKQuery(useGetPostsQuery, bedid);
    const posts = data as postInterface[];

    function generateLatestPosts() {
        const latestPosts = posts?.slice(0, 5).map(post => <PostPreview key={post.id} post={post} />);
        return latestPosts;
    };

    return (
        <>
            <section>
                <h2>Bulletin</h2>
                <ul>
                    {generateLatestPosts()}
                </ul>
                <Link to={`/share/${bedid}/bulletin`}>See all bulletin posts and announcements</Link>
            </section>
        </>
    );
};

export default BulletinLatest;