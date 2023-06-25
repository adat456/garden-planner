import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { isJWTInvalid } from "../Shared/helpers";

const BedPlantingPage: React.FC = function() {
    const [ bedIds, setBedIds ] = useState<number[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        async function getBedIds() {
            try {
                const req = await fetch("http://localhost:3000/get-bedids", {credentials: "include"});
                const res = await req.json();
                if (req.ok) {
                    setBedIds(res);
                } else {
                    // even though all API calls return just the err.message (a string), this message is rethrown as a whole error object (which is why it can be accessed as err.message in the catch block and by the helper fx)
                    throw new Error(res);
                };
            } catch(err) {
                const invalidJWTMessage = isJWTInvalid(err);
                if (invalidJWTMessage) {
                    console.log(invalidJWTMessage);
                    navigate("/sign-in");
                } else {
                    console.log(err.message);
                };
            };
        };
        getBedIds();
    }, []);

    function generateBedLinks() {
        let bedIdLinks = bedIds.map(id => <Link key={id} to={`/create/${id}`}>{`Bed ${id}`}</Link>);
        return bedIdLinks;
    };

    return (
        <div className="bed-planting-wrapper">
            <nav className="create-nav">
                {generateBedLinks()}
                <Link to="/create/new-bed" className="new-bed-link">+ New Bed</Link>
            </nav>
            <Outlet />
        </div>
    );
};

export default BedPlantingPage;