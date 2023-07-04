import { Outlet, Link } from "react-router-dom";
import { useGetBedsQuery } from "../app/apiSlice";
import { bedDataInterface } from "../app/interfaces";

const BedSharingPage: React.FC = function() {
    const bedsResult = useGetBedsQuery();
    const beds = bedsResult.data as bedDataInterface[];

    let links;

    function generateBedLinks() {
        let bedIdLinks = beds?.map(bed => <Link key={bed.id} to={`/share/${bed.id}`}>{bed.name}</Link>);
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
        <div>
            <nav>
                {links}
            </nav>
            <Outlet />
        </div>
    );
};

export default BedSharingPage;