import { useState, useEffect } from "react";
import AddEditRole from "./AddEditRole";
import ExampleRoles from "./ExampleRoles";
import AddedRole from "./AddedRole";
import { rolesInterface } from "../../../app/interfaces";
import { useGetBedsQuery, useGetPersonalPermissionsQuery } from "../../../app/apiSlice";
import { useWrapRTKQuery } from "../../../app/customHooks";

interface RoleGroupInterface {
    bedid: string | undefined,
};

const RoleGroup: React.FC<RoleGroupInterface> = function({ bedid }) {
    const [ addEditRoleVis, setAddEditRoleVis ] = useState(false);
    const [ exampleRolesVis, setExampleRolesVis ] = useState(false);
    const [ focusRole, setFocusRole ] = useState<rolesInterface | null>(null);

    const { data: bedObject } = useWrapRTKQuery(useGetBedsQuery);
    const bed = bedObject?.find(bed => bed.id === Number(bedid)) as bedDataInterface;
    const existingRoles = bed?.roles;

    const { data: permissionsData } = useWrapRTKQuery(useGetPersonalPermissionsQuery, bedid);
    const personalPermissions = permissionsData as string[];

    function generateExistingRoles() {
        let rolesArr;
        if (existingRoles) {
            rolesArr = existingRoles.map(role => (
                <AddedRole key={`custom-role-${role.id}`} role={role} bedid={bedid} setFocusRole={setFocusRole} setAddEditRoleVis={setAddEditRoleVis} />
            ));
        };
        return rolesArr;
    };

    useEffect(() => {
        if (addEditRoleVis) {
            const addEditRoleForm: HTMLDialogElement | null = document.querySelector(".add-edit-role-form");
            addEditRoleForm?.showModal();
        };
    }, [addEditRoleVis]);

    return (
        <>
            {personalPermissions?.includes("fullpermissions") || personalPermissions?.includes("rolespermission") ?
                <section>
                    <h3>Roles</h3> 
                    {generateExistingRoles()}

                    <button type="button" onClick={() => setAddEditRoleVis(true)}>Add a custom role</button>
                    {addEditRoleVis ? <AddEditRole bedid={bedid} setAddEditRoleVis={setAddEditRoleVis} focusRole={focusRole} setFocusRole={setFocusRole} /> : null}

                    <button type="button" onClick={() => setExampleRolesVis(!exampleRolesVis)}>{exampleRolesVis ? "Hide example roles" : "Show example roles"}</button>
                    {exampleRolesVis ? <ExampleRoles /> : null}
                </section>
                : null
            }
        </>
    );
};

export default RoleGroup;