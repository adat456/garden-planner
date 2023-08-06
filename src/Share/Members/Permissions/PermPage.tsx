import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetUserQuery, useGetPersonalPermissionsQuery } from "../../../app/apiSlice";
import { useWrapRTKQuery, useGetBedData } from "../../../app/customHooks";
import { bedDataInterface, userInterface } from "../../../app/interfaces";
import PermGroup from "./PermGroup";

const permissionsArr = [
    {id: 1, label: "Can change permissions", permission: "fullpermissions"},
    {id: 2, label: "Can add users, remove members, and assign roles", permission: "memberspermission"},
    {id: 3, label: "Can add add, edit, and delete roles", permission: "rolespermission"},
    {id: 4, label: "Can add, edit, and delete one's own events", permission: "eventspermission"},
    {id: 5, label: "Can add and delete event tags", permission: "tagspermission"},
    {id: 6, label: "Can add, edit, and delete one's own posts", permission: "postspermission"},
    {id: 7, label: "Can interact (liking, disliking, and commenting) with posts", permission: "postinteractionspermission"},
];

const PermissionsPage: React.FC = function() {
    const [ allDetailsVis, setAllDetailsVis ] = useState(false);

    const { bedid } = useParams();

    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const members = bed?.members;
    const roles = bed?.roles;

    const { data: userData } = useWrapRTKQuery(useGetUserQuery);
    const user = userData as userInterface;

    const { data: personalPermissionsData } = useWrapRTKQuery(useGetPersonalPermissionsQuery, bedid);
    const personalPermissions = personalPermissionsData as string[];

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
        const permissionGroups = permissionsArr.map(permission => <PermGroup key={permission.id} allDetailsVis={allDetailsVis} label={permission.label} permission={permission.permission} />);
        return permissionGroups;
    };

    return (
        <>  
            {!personalPermissions?.includes("fullpermissions") ? 
                <p>You do not have permission to view member and role permissions.</p> :
                <>
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
                    <br />

                    <section>
                        <h2>Permissions</h2>
                        <button type="button" onClick={() => setAllDetailsVis(!allDetailsVis)}>{allDetailsVis ? "Collapse all" : "Expand all"}</button>
                        {generatePermissionGroups()}
                    </section>
                </>
            }
        </>
    );
};

export default PermissionsPage;