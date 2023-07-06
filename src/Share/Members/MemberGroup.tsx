import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetBedsQuery, useUpdateMembersMutation } from "../../app/apiSlice";
import { membersInterface } from "../../app/interfaces";
import UserSearch from "./UserSearch";

const MemberGroup: React.FC = function({ socket }) {
    const [ searchMembersVis, setSearchMembersVis ] = useState(false);

    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const existingMembers = bedObject.bed?.members as membersInterface[];

    const [ updateMembers, { isLoading } ] = useUpdateMembersMutation();

    function generateMembers(status: string) {
        let membersArr;
        if (status === "pending") {
            const filteredMembers = existingMembers?.filter(member => member.status === status);
            membersArr = filteredMembers?.map(member => (
                <li key={member.id}>
                    <button type="button" onClick={() => removeMember(member.id)}>Remove member</button>
                    <p>{member.name}</p>
                    <p>{`Invite sent ${member.invitedate}`}</p>
                    {member.role? <p>{member.role.title}</p> : null}
                </li>
            ));
        } else if (status === "final") {
            const filteredMembers = existingMembers?.filter(member => member.status === status);
            membersArr = filteredMembers?.map(member => (
                <li key={member.id}>
                    <button type="button" onClick={() => removeMember(member.id)}>Remove member</button>
                    <p>{member.name}</p>
                    {member.role? <p>{member.role.title}</p> : null}
                </li>
            ));
        };
        return membersArr;
    };

    async function removeMember(id: number) {
        if (!isLoading) {
            try {
                const filteredMembers = existingMembers.filter(member => member.id !== id);
                await updateMembers({
                    members: filteredMembers,
                    bedid
                }).unwrap();
            } catch(err) {
                console.error("Unable to remove member: ", err.message);
            };
        };
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
            {searchMembersVis ? <UserSearch bedid={bedid} socket={socket} /> :  null }
        </section>
    );
};

export default MemberGroup;
