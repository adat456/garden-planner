import { useEffect, useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import Socket from "../app/socket";
import { useDispatch } from "react-redux";
import { useGetUserQuery } from "../app/apiSlice";
import { util } from "../app/apiSlice";
import { userInterface } from "../app/interfaces";
import Notifications from "./Notifications";
import Tools from "./Tools";

const LoggedInWrapper: React.FC = function({ isConnected }) {
    const [ newNotif, setNewNotif ] = useState("");

    const userResult = useGetUserQuery();
    const user = userResult.data as userInterface;

    useEffect(() => {
        if (!isConnected) Socket.connect();

        function notifHandler() {
            setNewNotif(new Date().toString());
        };

        Socket.on(`notifications-${user?.id}`, notifHandler);
        
        return () => {
            Socket.off(`notifications-${user?.id}`, notifHandler);
            // Socket.disconnect();
        };
    }, [Socket]);

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
                <Notifications newNotif={newNotif} />
                <p>{`Socket connection: ${isConnected}`}</p>
                <Tools />
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default LoggedInWrapper;