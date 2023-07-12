import { useParams, Link } from "react-router-dom";
import { useGetBedsQuery } from "../../app/apiSlice";
import { membersInterface } from "../../app/interfaces";

const MemberGroup: React.FC = function() {
    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const existingMembers = bedObject.bed?.members as membersInterface[];

    function generateMembers() {
        let membersArr;
        const filteredMembers = existingMembers?.filter(member => member.status === "final");
        membersArr = filteredMembers?.map(member => (
            <li key={member.id}>
                <p>{member.name}</p>
                {member.role? <p>{member.role.title}</p> : null}
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
            <Link to={`/share/${bedid}/members`}>Manage members and roles</Link>
        </section>
    );
};

export default MemberGroup;
