import { useEffect } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserInfo, userInfoWiped } from "./features/user/userSlice";

const LoggedInWrapper: React.FC = function() {
    const dispatch = useDispatch();
    const userInfoStatus = useSelector(state => state.user.status);

    useEffect(() => {
        if (userInfoStatus === "idle") {
            dispatch(fetchUserInfo());
        };
    }, [userInfoStatus, dispatch]);

    async function handleLogOut() {
        try {
            const req = await fetch("http://localhost:3000/users/log-out", {credentials: "include"});
            const res = await req.json();
            if (req.ok) {
                dispatch(userInfoWiped());
                console.log(res);
            };
        } catch(err) {
            console.log(err.message);
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
                    <Link to="sign-in" onClick={handleLogOut}>LOG OUT</Link>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default LoggedInWrapper;