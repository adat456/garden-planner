import { Outlet, NavLink, Link } from "react-router-dom";

const LoggedInWrapper: React.FC = function() {async function handleLogOut() {
        try {
            const req = await fetch("http://localhost:3000/users/log-out", {credentials: "include"});
            const res = await req.json();
            if (req.ok) {
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