import { Outlet, Link } from "react-router-dom";

const LoggedInWrapper: React.FC = function() {
    return (
        <>
            <header>
                <nav className="main-nav">
                    <Link to="/create/*">CREATE</Link>
                    <Link to="/share">SHARE</Link>
                    <Link to="/explore">EXPLORE</Link>
                    <Link to="/profile">PROFILE</Link>
                    <Link to="/sign-in">LOG OUT</Link>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default LoggedInWrapper;