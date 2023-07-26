import { useState } from "react";
import { useGetUserQuery, useGetBedsQuery, useUpdateMembersMutation, useAddNotificationMutation } from "../../app/apiSlice";
import { bedDataInterface, userInterface } from "../../app/interfaces";

interface initialResultInterface {
    id: string,
    username: string,
    firstname: string,
    lastname: string
};

const UserSearch: React.FC<{bedid: string | undefined}> = function({ bedid }) {
    const [ search, setSearch ] = useState("");
    const [ searchResults, setSearchResults ] = useState<initialResultInterface[]>([]);
    const [ numExtra, setNumExtra ] = useState(0);

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;
    const existingMembers = bed?.members;

    const userObject = useGetUserQuery(undefined);
    const user = userObject.data as userInterface;

    const [ updateMembers, { isLoading: membersIsLoading } ] = useUpdateMembersMutation();
    const [ addNotification, { isLoading: notificationIsLoading } ] = useAddNotificationMutation();

    async function handleSearchMemberChange(e: React.FormEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        const value = input.value;
        setSearch(value);
        const preppedValue = value.trim().toLowerCase();

        if (value === "") {
            setSearchResults([]);
            setNumExtra(0);
            return;
        };

        try {
            const req = await fetch(`http://localhost:3000/find-users/${preppedValue}`, {credentials: "include"});
            const res = await req.json();
            if (req.ok) {
                if (res.length > 5) {
                    setSearchResults(res.slice(0, 5));
                    setNumExtra(res.length - 5);
                } else {
                    setSearchResults(res);
                    setNumExtra(0);
                };
            } else {
                throw new Error(res);
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    function generateSearchResults() {
        const searchResultsArr = searchResults.map(result => (
            <li key={result.id}>
                <button type="button" onClick={() => addMember(result)}>Send invite</button>
                <p>{`${result.firstname} ${result.lastname}`}</p>
                <p>{`@${result.username}`}</p>
            </li>
        ));
        return searchResultsArr;
    };

    async function addMember(member: initialResultInterface) {
        if (!membersIsLoading && !notificationIsLoading && existingMembers) {
            try {
                await updateMembers({
                    members: [
                        ...existingMembers,
                            {
                                id: member.id,
                                username: member.username,
                                name: `${member.firstname} ${member.lastname}`,
                                role: undefined,
                                invitedate: new Date().toString(),
                                status: "pending",
                                finaldate: undefined
                            }
                    ],
                    bedid
                }).unwrap();
                
                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: member.id,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "memberinvite",
                    bedid: bed?.id,
                    bedname: bed?.name
                }).unwrap();
            } catch(err) {
                console.error("Unable to add member: ", err.message);
            };
        };
    };

    return (
        <>
            <form>
                <label htmlFor="search-members">Search by username</label>
                <input type="text" id="search-members" value={search} onChange={handleSearchMemberChange} />
                <button type="submit">Search</button>
            </form>
            <ul>
                {generateSearchResults()}
            </ul>
            {numExtra ?
                <p>{`+${numExtra} results`}</p> : null
            } 
        </>
    );
};

export default UserSearch;