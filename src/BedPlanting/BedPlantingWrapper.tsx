import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBeds } from "../features/beds/bedsSlice";
import { bedDataInterface } from "../Shared/interfaces";

const BedPlantingPage: React.FC = function() {
    const dispatch = useDispatch();
    const bedsInfoStatus = useSelector(state => state.beds.status);
    const bedsData: bedDataInterface[] = useSelector(state => state.beds.beds);

    useEffect(() => {
        if (bedsInfoStatus === "idle") {
            dispatch(fetchBeds());
        };
    }, [dispatch, bedsInfoStatus]);

    function generateBedLinks() {
        let bedIdLinks = bedsData?.map(bed => <Link key={bed.id} to={`/create/${bed.id}`}>{bed.name}</Link>);
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