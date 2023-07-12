import { useParams, Link } from "react-router-dom";
import { useGetBedsQuery } from "../../app/apiSlice";
import { bedDataInterface } from "../../app/interfaces";

const MemberGroup: React.FC = function() {
    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject?.bed as bedDataInterface;
    const existingMembers = bed?.members;

    // rather than storing the entire role interface/object in member details, only the role id is stored. although the role title must then be pulled from the list of bed roles in order to be displayed, the limited redundancy means that any future changes to the role (e.g., title edits, deletion) are automatically reflected among the members
    function findRoleTitle(roleId: string) {
        let roleTitle = null;
        bed?.roles.forEach(role => {
            if (role.id === roleId) roleTitle = <p>{role.title}</p>;
        });
        return roleTitle;
    };

    function generateMembers() {
        let membersArr;
        let filteredMembers = existingMembers?.filter(member => member.status === "final");
        filteredMembers = filteredMembers?.slice(0, 5);
        membersArr = filteredMembers?.map(member => (
            <li key={member.id}>
                <p>{member.name}</p>
                {member.role? findRoleTitle(member.role) : null}
            </li>
        ));
        return membersArr;
    };

    return (
        <section>
            <h2>Members</h2>
            <ul>
                {generateMembers()}
            </ul>
            {(existingMembers?.length - 5 > 0) ? 
                <p>{`+ ${existingMembers.length - 5} more`}</p> :
                null
            }
            <Link to={`/share/${bedid}/members`}>Manage members and roles</Link>
        </section>
    );
};

export default MemberGroup;
