import { useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { useGetUserQuery, useGetNotificationsQuery, useGetBedsQuery, useGetEventsQuery, util } from "../app/apiSlice";
import { userInterface } from "../app/interfaces";
import Notifications from "./Notifications";
import Tools from "./Tools";
import { isJWTInvalid } from "../app/helpers";

const LoggedInWrapper: React.FC = function() {
    const { data: userResult, error } = useGetUserQuery(undefined);
    const user = userResult as userInterface;
    const { refetch: refetchNotifications } = useGetNotificationsQuery(undefined);
    const { refetch: refetchBeds } = useGetBedsQuery(undefined);
    
    const navigate = useNavigate();
    useEffect(() => {
        console.log(error?.data);
        if (!user && isJWTInvalid(error?.data)) navigate("/sign-in");
    }, [error]);

    const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000";
    const socket = io(URL);
    useEffect(() => {
        socket.on("hello", (arg) => console.log(arg));

        async function updateNotifications(arg: string) {
            console.log(arg);
            await refetchNotifications();
            if (arg === "memberconfirmation") await refetchBeds;
        };
        socket.on(`notifications-${user?.id}`, arg => updateNotifications(arg));
        
        return () => {
            socket.off(`notifications-${user?.id}`, updateNotifications)
        };
    }, [socket]);

    const dispatch = useDispatch();
    async function handleLogOut() {
        try {
            dispatch(util.resetApiState());
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
                    {user ?
                        <Link to="sign-in" onClick={handleLogOut}>LOG OUT</Link> : null
                    }
                </nav>
                <Notifications />
                <Tools />
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default LoggedInWrapper;