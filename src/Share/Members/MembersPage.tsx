import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetBedsQuery } from "../../app/apiSlice";
import { membersInterface } from "../../app/interfaces";
import Member from "./Member";
import UserSearch from "./UserSearch";
import RoleGroup from "./Roles/RoleGroup";

const MembersPage: React.FC = function() {
    const [ searchMembersVis, setSearchMembersVis ] = useState(false);

    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const existingMembers = bedObject.bed?.members as membersInterface[];

    function generateMembers(status: string) {
        let membersArr;
        if (status === "pending") {
            const filteredMembers = existingMembers?.filter(member => member.status === status);
            membersArr = filteredMembers?.map(member => (
                <Member key={member.id} member={member} />
            ));
        } else if (status === "final") {
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
            <h2>Members</h2>
            <section>
                <h3>Current</h3>
                <ul>
                    {generateMembers("final")}
                </ul>
            </section>
            <section>
                <h3>Pending</h3>
                <ul>
                    {generateMembers("pending")}
                </ul>
            </section>
            
            <button type="button" onClick={() => setSearchMembersVis(!searchMembersVis)}>Add member</button>
            {searchMembersVis ? <UserSearch bedid={bedid} /> :  null }

            <hr />
            <RoleGroup bedid={bedid} />
        </section>
    );
};

export default MembersPage;