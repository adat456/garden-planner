import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetUserQuery, useGetPermissionsLogQuery, useUpdatePermissionsMutation } from "../../../app/apiSlice";
import { useWrapRTKMutation, useGetBedData } from "../../../app/customHooks";
import { bedDataInterface, userInterface, permissionsInterface } from "../../../app/interfaces";


interface permGroupInterface {
    allDetailsVis: boolean,
    label: string,
    permission: string
};

const PermGroup: React.FC<permGroupInterface> = function({ allDetailsVis, label, permission }) {
    const [ detailsVis, setDetailsVis ] = useState(false);
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ membersSearchResults, setMembersSearchResults ] = useState<{id: number, name: string}[]>([]);
    const [ rolesSearchResults, setRolesSearchResults ] = useState<{id: string, name: string}[]>([]);

    const { bedid } = useParams();

    const bed = useGetBedData(Number(bedid)) as bedDataInterface;
    const members = bed?.members;
    const roles = bed?.roles;

    const { data: userData } = useWrapRTKQuery(useGetUserQuery);
    const user = userData as userInterface;

    const { data: permissionsData} = useWrapRTKQuery(useGetPermissionsLogQuery, bedid);
    const permissionsLog = permissionsData as permissionsInterface;

    const { mutation: updatePermissions, isLoading: updatePermissionsIsLoading } = useWrapRTKMutation(useUpdatePermissionsMutation);

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
                if (member.name.toLowerCase().includes(preppedSearchTerm) || member.username.toLowerCase().includes(preppedSearchTerm)) updatedMembersSearchResults.push({id: member.id, name: member.name});
            });
            setMembersSearchResults(updatedMembersSearchResults);

            let updatedRolesSearchResults: {id: string, name: string}[] = [];
            roles.forEach(role => {
                if (role.title.toLowerCase().includes(preppedSearchTerm)) updatedRolesSearchResults.push({id: role.id, name: role.title});
            });
            setRolesSearchResults(updatedRolesSearchResults);
        };
    };

    async function togglePermission(group: string, id: string | number) {
        if (!updatePermissionsIsLoading) {
            try {
                await updatePermissions({
                    bedid,
                    permissions: { permission, group, id },
                }).unwrap();
            } catch(err) {
                console.error("Unable to toggle permissions: ", err.message);
            };
        };
    };

    function displaySearchResults() {
        const membersSearchResultsArr = membersSearchResults.map(result => (
            <button key={result.id} onClick={() => togglePermission("member", result.id)}>
                <p>{result.name}</p>
            </button>
        ));
        const rolesSearchResultsArr = rolesSearchResults.map(result => (
            <button key={result.id} onClick={() => togglePermission("role", result.id)}>
                <p>{result.name}</p>
            </button>
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

    function displayAddedMembersRoles() {
        const addedMembers = permissionsLog?.[`${permission}memberids`].map((id: number) => { 
            const matchingMember = bed?.members.find(member => member.id === id);
            const memberName = matchingMember?.name;
            return (
                <button key={id} onClick={() => togglePermission("member", id)}>
                    <p>{memberName}</p>
                </button>
            );
        });
        const addedRoles = permissionsLog?.[`${permission}roleids`].map((id: string) => {
            const matchingRole = bed?.roles.find(role => role.id === id);
            const roleTitle = matchingRole?.title;
            return (
                <button key={id} onClick={() => togglePermission("role", id)}>
                    <p>{roleTitle}</p>
                </button>
            );
        });
            
        return (
            <>
                <div>
                    {addedMembers}
                </div>
                <div>
                    {addedRoles}
                </div>
            </>
        );
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
                    {displayAddedMembersRoles()}
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