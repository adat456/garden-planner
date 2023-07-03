import { Outlet, Link } from "react-router-dom";
import { useGetBedsQuery } from "../app/apiSlice";
import { bedDataInterface } from "../app/interfaces";

const BedPlantingPage: React.FC = function() {
    const bedsResult = useGetBedsQuery();
    const beds = bedsResult.data as bedDataInterface[];

    let links;

    function generateBedLinks() {
        let bedIdLinks = beds?.map(bed => <Link key={bed.id} to={`/create/${bed.id}`}>{bed.name}</Link>);
        return bedIdLinks;
    };

    if (bedsResult.isLoading) {
        links = <p>Loading links...</p>;
    } else if (bedsResult.isSuccess) {
        links = generateBedLinks();
    } else if (bedsResult.isError) {
        links = <p>Unable to retrieve bed links.</p>
    };

    return (
        <div className="bed-planting-wrapper">
            <nav className="create-nav">
                {links}
                {bedsResult.isSuccess ?
                    <Link to="/create/new-bed" className="new-bed-link">+ New Bed</Link> : null
                }   
            </nav>
            <Outlet />
        </div>
    );
};

export default BedPlantingPage;