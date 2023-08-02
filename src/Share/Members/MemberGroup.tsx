import { useParams, Link } from "react-router-dom";
import { useGetBedsQuery, useGetPersonalPermissionsQuery } from "../../app/apiSlice";
import { useWrapRTKQuery } from "../../app/customHooks";
import { bedDataInterface, membersInterface } from "../../app/interfaces";

const MemberGroup: React.FC = function() {
    const { bedid } = useParams();

    const { data: bedObject } = useWrapRTKQuery(useGetBedsQuery);
    const bed = bedObject?.find(bed => bed.id === Number(bedid)) as bedDataInterface;
    const existingMembers = bed?.members as membersInterface[];

    const { data: permissionsData } = useWrapRTKQuery(useGetPersonalPermissionsQuery, bedid);
    const personalPermissions = permissionsData as string[];

    function generateMembers() {
        let membersArr;
        let filteredMembers = existingMembers?.filter(member => member.status === "accepted");
        filteredMembers = filteredMembers?.slice(0, 5);
        membersArr = filteredMembers?.map(member => (
            <li key={member.id}>
                <p>{member.name}</p>
            </li>
        ));
        return membersArr;
    };

    return (
        <section>
            <h2>Members</h2>
            <ul>
                {generateMembers()}
            </ul>
            {(existingMembers?.length - 5 > 0) ? 
                <p>{`+ ${existingMembers.length - 5} more`}</p> :
                null
            }
            <Link to={`/share/${bedid}/members`}>
                {personalPermissions?.includes("fullpermissions") || personalPermissions?.includes("memberspermission") ? 
                    "Manage all members" : "See all members" 
                }
            </Link>
        </section>
    );
};

export default MemberGroup;
