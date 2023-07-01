import { useParams } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectBed } from "../app/features/bedsSlice";
import { bedDataInterface } from "../app/interfaces";

import Grid from "./Grid";
import MemberGroup from "./MemberGroup";
import RoleGroup from "./Roles/RoleGroup";

const BedSharingGroup: React.FC = function() {
    const { bedid } = useParams();
    const bedData: bedDataInterface = useAppSelector(state => selectBed(state, Number(bedid)));

    return (
        <div>
            <h1>{bedData?.name}</h1>
            <Grid bedData={bedData} />
            <MemberGroup />
            <RoleGroup bedid={bedid} />
        </div>
    );
};

export default BedSharingGroup;