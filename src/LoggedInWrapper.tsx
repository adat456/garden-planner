import { Outlet, Link } from "react-router-dom";

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
                    <Link to="/create/*">CREATE</Link>
                    <Link to="/share">SHARE</Link>
                    <Link to="/explore">EXPLORE</Link>
                    <Link to="/profile">PROFILE</Link>
                    <Link to="/sign-in" onClick={handleLogOut}>LOG OUT</Link>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default LoggedInWrapper;