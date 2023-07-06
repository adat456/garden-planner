import { useParams } from "react-router-dom";
import { useGetBedsQuery } from "../app/apiSlice";
import { bedDataInterface } from "../app/interfaces";

import Grid from "./Grid";
import MemberGroup from "./Members/MemberGroup";
import RoleGroup from "./Roles/RoleGroup";

const BedSharingGroup: React.FC = function({ socket }) {
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
            <Grid bedData={bed} />
            <MemberGroup socket={socket} />
            <RoleGroup bedid={bedid} />
        </div>
    );
};

export default BedSharingGroup;