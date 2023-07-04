import { Outlet, NavLink, Link } from "react-router-dom";
import { useGetUserQuery } from "./app/apiSlice";
import { useDispatch } from "react-redux";
import { util } from "./app/apiSlice";

const LoggedInWrapper: React.FC = function() {
    const userResult = useGetUserQuery();
    const user = userResult.data;

    const dispatch = useDispatch();

    async function handleLogOut() {
        try {
            await dispatch(util.resetApiState());
        } catch(err) {
            console.error("Unable to clear API data: ", err.message)
        };
    };

    return (
        <>
            <header>
                <nav className="main-nav">
                    <NavLink to="create">CREATE</NavLink>
                    <NavLink to="share">SHARE</NavLink>
                    <NavLink to="explore">EXPLORE</NavLink>
                    <NavLink to="profile">PROFILE</NavLink>
                    {userResult.isSuccess ?
                        <Link to="sign-in" onClick={handleLogOut}>LOG OUT</Link> : null
                    }
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default LoggedInWrapper;