import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetBedsQuery, useGetUserQuery } from "../../../app/apiSlice";
import { useWrapRTKQuery } from "../../../app/customHooks";
import { bedDataInterface, userInterface, membersInterface, rolesInterface, permissionsInterface } from "../../../app/interfaces";


interface permGroupInterface {
    allDetailsVis: boolean,
    label: string,
    column: string
};

const PermGroup: React.FC<permGroupInterface> = function({ allDetailsVis, label, column }) {
    const [ detailsVis, setDetailsVis ] = useState(false);
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ membersSearchResults, setMembersSearchResults ] = useState<{id: number, name: string}[]>([]);
    const [ rolesSearchResults, setRolesSearchResults ] = useState<{id: string, name: string}[]>([]);

    const { bedid } = useParams();

    const { data: bedObject } = useWrapRTKQuery(useGetBedsQuery);
    const bed = bedObject?.find(bed => bed.id === Number(bedid)) as bedDataInterface;
    const members = bed?.members as membersInterface[];
    const roles = bed?.roles as rolesInterface[];

    const { data: userData } = useWrapRTKQuery(useGetUserQuery);
    const user = userData as userInterface;

    function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        setSearchTerm(input.value);
        const preppedSearchTerm = input.value.toLowerCase().trim();

        if (preppedSearchTerm.length === 0) {
            setMembersSearchResults([]);
            setRolesSearchResults([]);
        } else {
            let updatedMembersSearchResults: {id: number, name: string}[] = [];
            members.forEach(member => {
                if (member.name.includes(preppedSearchTerm) || member.username.includes(preppedSearchTerm)) updatedMembersSearchResults.push({id: member.id, name: member.name});
            });
            setMembersSearchResults(updatedMembersSearchResults);

            let updatedRolesSearchResults: {id: string, name: string}[] = [];
            roles.forEach(role => {
                if (role.title.includes(preppedSearchTerm)) updatedRolesSearchResults.push({id: role.id, name: role.title});
            });
            setRolesSearchResults(updatedRolesSearchResults);
        };
    };

    function displaySearchResults() {
        const membersSearchResultsArr = membersSearchResults.map(result => (
            <div key={result.id}>
                <p>{result.name}</p>
            </div>
        ));
        const rolesSearchResultsArr = rolesSearchResults.map(result => (
            <div key={result.id}>
                <p>{result.name}</p>
            </div>
        ));

        return (
            <>
                <div>
                    {membersSearchResultsArr}
                </div>
                <div>
                    {rolesSearchResultsArr}
                </div>
            </>
        );
    };

    async function addPermission() {

    };

    async function removePermission() {

    };

    useEffect(() => {
        setDetailsVis(allDetailsVis);
    }, [allDetailsVis]);

    return (
        <div>
            <h2>{label}</h2>
            <button type="button" onClick={() => setDetailsVis(!detailsVis)}>{detailsVis ? "Collapse" : "Expand"}</button>
            {detailsVis ?
                <>
                    <div>
                        <label htmlFor="searchTerm">Add a member or role:</label>
                        <input type="text" value={searchTerm} onChange={handleSearchTermChange} />
                    </div>
                    {displaySearchResults()}
                </> 
                : null
            }
            
            <br />
            <br />
        </div>
    );
};

export default PermGroup;