import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchBeds } from "../app/features/bedsSlice";
import { bedDataInterface } from "../app/interfaces";

const BedSharingPage: React.FC = function() {
    const dispatch = useAppDispatch();
    const bedsInfoStatus = useAppSelector(state => state.beds.status);
    const bedsData: bedDataInterface[] = useAppSelector(state => state.beds.beds);

    useEffect(() => {
        if (bedsInfoStatus === "idle") {
            dispatch(fetchBeds());
        };
    }, [dispatch, bedsInfoStatus]);

    function generateBedLinks() {
        let bedIdLinks = bedsData?.map(bed => <Link key={bed.id} to={`/share/${bed.id}`}>{bed.name}</Link>);
        return bedIdLinks;
    };

    return (
        <div>
            <nav>
                {generateBedLinks()}
            </nav>
            <Outlet />
        </div>
    );
};

export default BedSharingPage;