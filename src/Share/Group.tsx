import { useParams } from "react-router-dom";
import { useGetBedsQuery } from "../app/apiSlice";
import { bedDataInterface } from "../app/interfaces";

import Grid from "./Grid";
import EventsGroup from "./Events/EventsGroup";
import MemberGroup from "./Members/MemberGroup";
import BulletinLatest from "./Bulletin/BulletinLatest";

const BedSharingGroup: React.FC = function() {
    const { bedid } = useParams();
    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed;

    return (
        <div>
            <h1>{bed?.name}</h1>
            <EventsGroup />
            <Grid bedData={bed} />
            <MemberGroup />
            <BulletinLatest />
        </div>
    );
};

export default BedSharingGroup;