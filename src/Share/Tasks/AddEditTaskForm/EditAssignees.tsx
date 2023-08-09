import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetBedData } from "../../../app/customHooks";
import { bedDataInterface } from "../../../app/interfaces";

interface editAssigneesInterface {
    setAssignedtomembers: React.Dispatch<React.SetStateAction<number[]>>,
    assignedtomembers: number[],
    setAssignedtoroles: React.Dispatch<React.SetStateAction<string[]>>,
    assignedtoroles: string[],
};

const EditAssignees: React.FC<editAssigneesInterface> = function({ setAssignedtomembers, assignedtomembers, setAssignedtoroles, assignedtoroles }) {
    const [ assignedtosearch, setAssignedtosearch ] = useState("");
    const [ assignedtoresults, setAssignedtoresults ] = useState<{id: number, name: string, category: string}[]>([]);

    const { bedid } = useParams();

    const bed = useGetBedData(Number(bedid)) as bedDataInterface;

    function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        setAssignedtosearch(input.value);
        const preppedSearchTerm = input.value.toLowerCase().trim();

        if (preppedSearchTerm.length === 0) {
            setAssignedtoresults([]);
        } else {
            let updatedSearchResults: {id: number, name: string, category: string}[] = [];

            bed?.members.forEach(member => {
                if (member.name.toLowerCase().includes(preppedSearchTerm) || member.username.toLowerCase().includes(preppedSearchTerm)) updatedSearchResults.push({id: member.id, name: member.name, category: "member"});
            });
            bed?.roles.forEach(role => {
                if (role.title.toLowerCase().includes(preppedSearchTerm)) updatedSearchResults.push({id: role.id, name: role.title, category: "role"});
            });

            setAssignedtoresults(updatedSearchResults);
        };
    };

    function generateSearchResults() {
        const searchResults = assignedtoresults?.map(result => (
            <li key={result.id}>
                <button type="button" onClick={() => handleAddAssignee(result.category, result.id)}>{result.name}</button>
            </li>
        ));
        return searchResults;
    };

    function handleAddAssignee(category: string, id: string | number) {
        if (category === "member" && typeof id === "number") setAssignedtomembers([...assignedtomembers, id]);
        if (category === "role" && typeof id === "string") setAssignedtoroles([...assignedtoroles, id]);
    };

    function handleRemoveAssignee(category: string, id: string | number) {
        if (category === "member" && typeof id === "number") setAssignedtomembers(assignedtomembers.filter(memberid => memberid !== id));
        if (category === "role" && typeof id === "string") setAssignedtoroles(assignedtoroles.filter(roleid => roleid !== id));
    };

    function generateAssignees() {
        let assignees = [];
        assignedtomembers.forEach(memberid => {
            const matchingMember = bed?.members.find(member => member.id === memberid);
            assignees.push(
                <li key={matchingMember?.id}>
                    <button type="button" onClick={() => handleRemoveAssignee("member", matchingMember?.id)}>{matchingMember?.name}</button>
                </li>
            );
        });
        assignedtoroles.forEach(roleid => {
            const matchingRole = bed?.roles.find(role => role.id === roleid);
            assignees.push(
                <li key={matchingRole?.id}>
                    <button type="button" onClick={() => handleRemoveAssignee("role", matchingRole?.id)}>{matchingRole?.title}</button>
                </li>
            );
        });
        return assignees;
    };

    return (
        <div>
            <label htmlFor="assignedtosearch">Assign to</label>
            {generateAssignees()}
            <input type="text" value={assignedtosearch} onChange={handleSearchTermChange} />
            {generateSearchResults()}
        </div>
    );
};  

export default EditAssignees;