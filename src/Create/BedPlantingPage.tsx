import { Outlet, Link } from "react-router-dom";
import { useGetBedsQuery } from "../app/apiSlice";
import { useWrapRTKQuery } from "../app/customHooks";
import { bedDataInterface } from "../app/interfaces";

const BedPlantingPage: React.FC = function() {
    const { data, isLoading, isSuccess, isError } = useWrapRTKQuery(useGetBedsQuery);
    const beds = data as bedDataInterface[];

    let links;

    function generateBedLinks() {
        let bedIdLinks = beds?.map(bed => <Link key={bed.id} to={`/create/${bed.id}`}>{bed.name}</Link>);
        return bedIdLinks;
    };

    if (isLoading) {
        links = <p>Loading links...</p>;
    } else if (isSuccess) {
        links = generateBedLinks();
    } else if (isError) {
        links = <p>Unable to retrieve bed links.</p>
    };

    return (
        <div className="bed-planting-wrapper">
            <nav className="create-nav">
                {links}
                {isSuccess ?
                    <Link to="/create/new-bed" className="new-bed-link">+ New Bed</Link> : null
                }   
            </nav>
            <Outlet />
        </div>
    );
};

export default BedPlantingPage;