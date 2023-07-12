import { useState } from "react";
import { useParams } from "react-router-dom";
import { bedDataInterface, membersInterface } from "../../app/interfaces";
import { useUpdateMembersMutation, useGetBedsQuery } from "../../app/apiSlice";

interface memberInterface {
    member: membersInterface
};

const Member: React.FC<memberInterface> = function({ member }) {
    const [ assigningRole, setAssigningRole ] = useState(false);
    const [ role, setRole ] = useState(member.role || "");

    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;
    const existingMembers = bedObject.bed?.members as membersInterface[];

    const [ updateMembers, { isLoading } ] = useUpdateMembersMutation();

    function findRoleTitle(id: string) {
        let roleTitle = null;
        bed?.roles.forEach(role => {
            if (role.id === id) roleTitle = <p>{role.title}</p>;
        });
        return roleTitle;
    };

    function generateRoleOptions() {
        const roleOptions = bed?.roles.map(role => (
            <option key={role.id} value={role.id}>{role.title}</option>
        ));
        return roleOptions;
    };

    async function updateMemberRole() {
        if (!isLoading) {
            try {
                const filteredMembers = existingMembers.filter(existingMember => existingMember.id !== member.id);
                await updateMembers({
                    bedid,
                    members: [...filteredMembers, {
                        ...member,
                        role: role
                    }]
                });
                setAssigningRole(false);
            } catch(err) {
                console.error("Unable to update member role: ", err.message);
            };
        };
    };

    async function removeMember() {
        if (!isLoading) {
            try {
                const filteredMembers = existingMembers.filter(existingMember => existingMember.id !== member.id);
                await updateMembers({
                    bedid,
                    members: filteredMembers
                }).unwrap();
            } catch(err) {
                console.error("Unable to remove member: ", err.message);
            };
        };
    };

    return (
        <li key={member.id}>
            <p>{member.name}</p>
            {member.status === "pending" ?
                <p>{`Invite sent ${member.invitedate}`}</p> : null
            }
            {member.role? 
                <>  
                    {assigningRole ?
                        <>
                            <label htmlFor="role"></label>
                            <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value=""></option>
                                {generateRoleOptions()}
                            </select>
                        </>
                        : 
                        findRoleTitle(member.role)
                    }
                </>
                : 
                <>  
                    {assigningRole ?
                        <>
                            <label htmlFor="role"></label>
                            <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value=""></option>
                                {generateRoleOptions()}
                            </select>
                        </>
                        : 
                        null
                    }
                </>
            }
            <button type="button" onClick={assigningRole ? updateMemberRole : () => setAssigningRole(!assigningRole)}>{!assigningRole ? "Assign role" : "Save"}</button>
            <button type="button" onClick={removeMember}>Remove member</button>
        </li>
    )
};

export default Member;