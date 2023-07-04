import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetBedsQuery } from "../../app/apiSlice";
import { membersInterface } from "../../app/interfaces";
import UserSearch from "./UserSearch";

const MemberGroup: React.FC = function() {
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
                <li key={member.id}>
                    <button type="button">Remove member</button>
                    <p>{member.name}</p>
                    {member.role? <p>{member.role.title}</p> : null}
                </li>
            ));
        } else if (status === "final") {
            const filteredMembers = existingMembers?.filter(member => member.status === status);
            membersArr = filteredMembers?.map(member => (
                <li key={member.id}>
                    <button type="button">Remove member</button>
                    <p>{member.name}</p>
                    {member.role? <p>{member.role.title}</p> : null}
                </li>
            ));
        };
        return membersArr;
    };

    return (
        <section>
            <h2>Members</h2>
            <section>
                <h3>Current</h3>
                <ul>
                    {generateMembers("current")}
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
        </section>
    );
};

export default MemberGroup;
