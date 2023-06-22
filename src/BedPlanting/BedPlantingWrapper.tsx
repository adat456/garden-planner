import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";

const BedPlantingPage: React.FC = function() {
    const [ bedIds, setBedIds ] = useState<number[]>([]);

    useEffect(() => {
        async function getBedIds() {
            try {
                const req = await fetch("http://localhost:3000/get-bedids", {credentials: "include"});
                const res = await req.json();
                if (req.ok) {
                    setBedIds(res);
                };
            } catch(err) {
                console.log(err);
            };
        };
        getBedIds();
    }, []);

    function generateBedLinks() {
        let bedIdLinks = bedIds.map(id => <Link key={id} to={`/create/${id}`}>{`Bed ${id}`}</Link>);
        return bedIdLinks;
    };

    return (
        <>
            <nav>
                {generateBedLinks()}
                <Link to="/create/new-bed">+ New Bed</Link>
            </nav>
            <Outlet />
        </>
    );
};

export default BedPlantingPage;