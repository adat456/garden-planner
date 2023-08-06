import { useState } from "react";
import { rolesInterface, bedDataInterface } from "../../../app/interfaces";
import { useUpdateRolesMutation } from "../../../app/apiSlice";
import { useWrapRTKMutation, useGetBedData } from "../../../app/customHooks";
import * as React from "react";

interface addedRoleInterface {
    role: rolesInterface,
    bedid: string | undefined
    setAddEditRoleVis: React.Dispatch<React.SetStateAction<boolean>>,
    setFocusRole: React.Dispatch<React.SetStateAction<rolesInterface>>
};

const AddedRole: React.FC<addedRoleInterface> = function({ role, bedid, setAddEditRoleVis, setFocusRole }) {
    const [ dutiesVis, setDutiesVis ] = useState(false);

    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const existingRoles = bed?.roles;

    const { mutation: updateRoles, isLoading } = useWrapRTKMutation(useUpdateRolesMutation);

    function handleEditRole() {
        setFocusRole(role);
        setAddEditRoleVis(true);
    };

    async function handleDeleteRole() {
        if (!isLoading) {
            try { 
                const updatedRoles = existingRoles.filter(existingRole => existingRole.id !== role?.id);
                await updateRoles(
                    {
                        roles: updatedRoles,
                        bedid 
                    }
                ).unwrap();
            } catch(err) {
                console.error("Unable to delete role: ", err.message);
            };
        };
    };

    return (
        <li>
            <p>{role.title}</p>
            <button type="button" onClick={() => setDutiesVis(!dutiesVis)}>{dutiesVis ? "Hide duties" : "Show duties"}</button>
            {dutiesVis ?
                <ul>
                    {role.duties.map((duty, index) => (
                        <li key={`custom-duty-${index}`}>{duty.value}</li>
                    ))}
                </ul> : null
            }
            <button type="button" onClick={handleEditRole}>Edit</button>
            <button type="button" onClick={handleDeleteRole}>Delete</button>
        </li>
    );
};

export default AddedRole;