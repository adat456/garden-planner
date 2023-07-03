import { Outlet, NavLink, Link } from "react-router-dom";
import { useGetUserQuery } from "./app/apiSlice";

const LoggedInWrapper: React.FC = function() {
    const userResult = useGetUserQuery();
    const user = userResult.data;

    let content;

    if (userResult.isLoading) {
        content = <p>User info loading.</p>;
    } else if (userResult.isSuccess) {
        content = <p>{user.username}</p>
    } else if (userResult.isError) {
        content = <p>Error encounered.</p>
    };

    return (
        <>
            <header>
                <nav className="main-nav">
                    <NavLink to="create">CREATE</NavLink>
                    <NavLink to="share">SHARE</NavLink>
                    <NavLink to="explore">EXPLORE</NavLink>
                    <NavLink to="profile">PROFILE</NavLink>
                    {/* <Link to="sign-in" onClick={handleLogOut}>LOG OUT</Link> */}
                    {content}
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default LoggedInWrapper;