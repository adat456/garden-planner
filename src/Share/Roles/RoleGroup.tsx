import AddRole from "./AddEditRole";
import ExampleRoles from "./ExampleRoles";
import CustomRole from "./CustomRole";
import { useGetBedsQuery } from "../../app/apiSlice";

interface RoleGroupInterface {
    bedid: string | undefined,
};

const RoleGroup: React.FC<RoleGroupInterface> = function({ bedid }) {
    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const existingRoles = bedObject.bed?.roles;

    function generateCustomRoles() {
        let customRolesArr;
        if (existingRoles) {
            console.log(existingRoles);
            customRolesArr = existingRoles.map((role, index) => (
                <CustomRole key={`custom-role-${index}`} role={role} bedid={bedid} />
            ));
        };
        return customRolesArr;
    };

    return (
        <section>
            <h3>Roles</h3> 
            <AddRole bedid={bedid} />
            <h4>Custom roles</h4>
            {generateCustomRoles()}
            <h4>Commonly assigned roles</h4>
            <ExampleRoles />
        </section>
    );
};

export default RoleGroup;