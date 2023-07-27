import { Outlet, Link } from "react-router-dom";
import { useGetBedsQuery } from "../app/apiSlice";
import { useWrapRTKQuery } from "../app/customHooks";
import { bedDataInterface } from "../app/interfaces";

const BedSharingPage: React.FC = function() {
    const { data, isLoading, isSuccess, isError } = useWrapRTKQuery(useGetBedsQuery);
    const beds = data as bedDataInterface[];

    let links;

    function generateBedLinks() {
        let bedIdLinks = beds?.map(bed => <Link key={bed.id} to={`/share/${bed.id}`}>{bed.name}</Link>);
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
        <div>
            <nav>
                {links}
            </nav>
            <Outlet />
        </div>
    );
};

export default BedSharingPage;