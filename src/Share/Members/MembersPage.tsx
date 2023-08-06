import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetPersonalPermissionsQuery } from "../../app/apiSlice";
import { useWrapRTKQuery, useGetBedData } from "../../app/customHooks";
import { membersInterface, bedDataInterface } from "../../app/interfaces";
import Member from "./Member";
import UserSearch from "./UserSearch";
import RoleGroup from "./Roles/RoleGroup";

const MembersPage: React.FC = function() {
    const [ searchMembersVis, setSearchMembersVis ] = useState(false);

    const { bedid } = useParams();

    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const existingMembers = bed?.members as membersInterface[];

    const { data: permissionsData } = useWrapRTKQuery(useGetPersonalPermissionsQuery, bedid);
    const personalPermissions = permissionsData as string[];

    function generateMembers(status: string) {
        let membersArr;
        if (status === "pending") {
            const filteredMembers = existingMembers?.filter(member => member.status === status);
            membersArr = filteredMembers?.map(member => (
                <Member key={member.id} member={member} />
            ));
        } else if (status === "accepted") {
            const filteredMembers = existingMembers?.filter(member => member.status === status);
            membersArr = filteredMembers?.map(member => (
                <Member key={member.id} member={member} />
            ));
        };
        return membersArr;
    };

    return (
        <section>
            <Link to={`/share/${bedid}`}>Return to bed overview</Link>
            {personalPermissions?.includes("fullpermissions") ?
                <Link to={`/share/${bedid}/members/permissions`}>Manage permissions</Link> : null
            }

            <section>
                <h2>Current Members</h2>
                <ul>
                    {generateMembers("accepted")}
                </ul>
            </section>

            {personalPermissions?.includes("fullpermissions") || personalPermissions?.includes("memberspermission") ?
                <>
                    <section>
                        <h2>Pending Members</h2>
                        <ul>
                            {generateMembers("pending")}
                        </ul>
                    </section>
                    <div>
                        <button type="button" onClick={() => setSearchMembersVis(!searchMembersVis)}>Add member</button>
                        {searchMembersVis ? <UserSearch bedid={bedid} /> :  null }
                    </div>
                </> : null
            }

            <hr />
            <RoleGroup bedid={bedid} />
        </section>
    );
};

export default MembersPage;