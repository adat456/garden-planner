import { useEffect } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useGetUserQuery, useGetNotificationsQuery, useGetBedsQuery, useGetEventsQuery } from "../app/apiSlice";
import { useWrapRTKQuery, useDynamicEventsQuery, useDynamicPermissionsQuery } from "../app/customHooks";
import { userInterface } from "../app/interfaces";
import Notifications from "./Notifications/Notifications";
import Tools from "./Tools";

const LoggedInWrapper: React.FC = function() {
    const { data: userData } = useWrapRTKQuery(useGetUserQuery);
    const user = userData as userInterface;
    const { refetch: refetchNotifications } = useWrapRTKQuery(useGetNotificationsQuery);
    const { refetch: refetchBeds } = useWrapRTKQuery(useGetBedsQuery);

    const setBedIdForEvents = useDynamicEventsQuery();
    const setBedIdForPermissions = useDynamicPermissionsQuery();

    const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000";
    const socket = io(URL);
    useEffect(() => {
        async function updateAll(type?: string, id?: string) {
            if (type === "rsvpinvite" || type === "rsvpconfirmation") {
                refetchNotifications();
                setBedIdForEvents(id?.toString());
            } else if (type === "memberinvite" || type === "memberconfirmation" || type === "memberrejection") {
                refetchNotifications();
                refetchBeds();
            } else if (type === "permissionsupdate") {
                setBedIdForPermissions(id?.toString());
            };
        };
        socket.on(`notifications-${user?.id}`, (type, id) => updateAll(type, id));
        
        return () => {
            socket.off(`notifications-${user?.id}`, updateAll)
        };
    }, [socket]);

    async function handleLogOut() {
        try {
            const req = await fetch("http://localhost:3000/users/log-out", { credentials: "include" });
            const res = await req.json();
            if (req.ok) {
                console.log(res);
            } else {
                throw new Error(res);
            };
        } catch(err) {
            console.error("Unable to invalidate JWT: ", err.message)
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