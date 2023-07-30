import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetBedsQuery, useGetUserQuery } from "../../../app/apiSlice";
import { useWrapRTKQuery } from "../../../app/customHooks";
import { bedDataInterface, membersInterface, rolesInterface, userInterface } from "../../../app/interfaces";
import PermGroup from "./PermGroup";

const permissionsArr = [
    {id: 1, label: "Can change permissions", column: "permissionpermissions"},
    {id: 2, label: "Can add users, remove members, and assign roles", column: "permissionmembers"},
    {id: 3, label: "Can add add, edit, and delete roles", column: "permissionroles"},
    {id: 4, label: "Can add, edit, and delete one's own events", column: "permissionevents"},
    {id: 5, label: "Can add and delete event tags", column: "permissionmembers"},
    {id: 6, label: "Can add users, edit, and delete one's own posts", column: "permissionposts"},
    {id: 7, label: "Can interact (liking, disliking, and commenting) with posts", column: "permissionpostinteractions"},
];

const PermissionsPage: React.FC = function() {
    const [ allDetailsVis, setAllDetailsVis ] = useState(false);

    const { bedid } = useParams();

    const { data: bedObject } = useWrapRTKQuery(useGetBedsQuery);
    const bed = bedObject?.find(bed => bed.id === Number(bedid)) as bedDataInterface;
    const members = bed?.members as membersInterface[];
    const roles = bed?.roles as rolesInterface[];

    const { data: userData } = useWrapRTKQuery(useGetUserQuery);
    const user = userData as userInterface;

    function generateMembers() {
        const filteredMembersArr = members?.filter(member => member.status === "accepted");
        const membersArr = filteredMembersArr?.map(member => (
            <div key={member.id}>
                <p>{member.name}</p>
            </div>
        ));
        return membersArr;
    };

    function generateRoles() {
        const rolesArr = roles?.map(role => (
            <div key={role.id}>
                <p>{role.title}</p>
            </div>
        ));
        return rolesArr;
    };

    function generatePermissionGroups() {
        const permissionGroups = permissionsArr.map(permission => <PermGroup key={permission.id} allDetailsVis={allDetailsVis} label={permission.label} column={permission.column} />);
        return permissionGroups;
    };

    return (
        <>
            <div>
                <section>
                    <h2>Members</h2>
                    {generateMembers()}
                </section>
                <br />
                <section>
                    <h2>Roles</h2>  
                    {generateRoles()}
                </section>
                <br />
            </div>
            <br />
            <section>
                <h2>Permissions</h2>
                <button type="button" onClick={() => setAllDetailsVis(!allDetailsVis)}>{allDetailsVis ? "Collapse all" : "Expand all"}</button>
                {generatePermissionGroups()}
            </section>
        </>
    );
};

export default PermissionsPage;