import { useState } from "react";
import AddEditRole from "./AddEditRole";
import { rolesInterface } from "../../app/interfaces";
import { useGetBedsQuery, useUpdateRolesMutation } from "../../app/apiSlice";

interface customRoleInterface {
    role: rolesInterface,
    bedid: string | undefined
};

const CustomRole: React.FC<customRoleInterface> = function({ role, bedid }) {
    const [ dutiesVis, setDutiesVis ] = useState(false);
    const [ editVis, setEditVis ] = useState(false);

    const [ updateRoles, { isLoading} ] = useUpdateRolesMutation();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const existingRoles = bedObject.bed?.roles as rolesInterface[];

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

    if (!editVis) {
        return (
            <li>
                <input type="checkbox" name="custom-role" id={role.title} />
                <label htmlFor={role.title}>{role.title}</label>
                <button type="button" onClick={() => setDutiesVis(!dutiesVis)}>Show duties</button>
                {dutiesVis ?
                    <ul>
                        {role.duties.map((duty, index) => (
                            <li key={`custom-duty-${index}`}>{duty.value}</li>
                        ))}
                    </ul> : null
                }
                <button type="button" onClick={() => setEditVis(!editVis)}>Edit</button>
                <button type="button" onClick={handleDeleteRole}>Delete</button>
            </li>
        );
    } else {
        return (
            <li>
                <AddEditRole bedid={bedid} role={role} setEditVis={setEditVis} />
                <button type="button" onClick={() => setEditVis(!editVis)}>Finish editing</button>
            </li>
        )
    }
};

export default CustomRole;