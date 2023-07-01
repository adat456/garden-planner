import AddRole from "./AddRole";
import ExampleRoles from "./ExampleRoles";

interface RoleGroupInterface {
    bedid: string,
};

const RoleGroup: React.FC<RoleGroupInterface> = function({ bedid }) {
    return (
        <section>
            <h3>Roles</h3>
            
            <AddRole bedid={bedid} />
            <ExampleRoles />
        </section>
    );
};

export default RoleGroup;