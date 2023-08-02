import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useGetPostsQuery, useGetPersonalPermissionsQuery } from "../../app/apiSlice";
import { useWrapRTKQuery } from "../../app/customHooks";
import { postInterface } from "../../app/interfaces";
import PostPreview from "./PostPreview";
import AddEditPost from "./AddEditPost";

const Bulletin: React.FC = function() {
    const [ AddEditPostVis, setAddEditPostVis ] = useState(false);

    const { bedid } = useParams();

    const { data } = useWrapRTKQuery(useGetPostsQuery, bedid);
    const posts = data as postInterface[];
    const { data: permissionsData } = useWrapRTKQuery(useGetPersonalPermissionsQuery, bedid);
    const personalPermissions = permissionsData as string[];

    function generatePosts() {
        const postsList = posts?.map(post => <PostPreview key={post.id} post={post} />);
        return postsList;
    };

    useEffect(() => {
        if (AddEditPostVis) {
            const AddEditPostForm: HTMLDialogElement | null = document.querySelector(".new-post-form");
            AddEditPostForm?.showModal();
        }
    }, [AddEditPostVis]);

    return (
        <>
            <div>
                <Link to={`/share/${bedid}`}>Return to bed overview</Link>
                <h1>Bulletin</h1>
                <ul>
                    {generatePosts()}
                </ul>
                {personalPermissions?.includes("fullpermissions") || personalPermissions?.includes("postspermission") ?
                    <button type="button" onClick={() => setAddEditPostVis(true)}>Add new post</button> : null
                }
            </div>
            {AddEditPostVis ? <AddEditPost setAddEditPostVis={setAddEditPostVis} /> : null}
        </>
    )
};

export default Bulletin;