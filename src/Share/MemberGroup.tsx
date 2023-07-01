import { useState } from "react";

interface memberInterface {
    username: string,
    id: number,
    firstname: string,
    lastname: string
    // role is potentially an id (number) to the role object in the db
    role?: string
};

const MemberGroup: React.FC = function() {
    const [ searchMembersVis, setSearchMembersVis ] = useState(false);
    const [ search, setSearch ] = useState("");
    const [ searchResults, setSearchResults ] = useState<memberInterface[]>([]);
    const [ numExtra, setNumExtra ] = useState(0);

    async function handleSearchMemberChange(e: React.FormEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        const value = input.value;
        setSearch(value);
        const preppedValue = value.trim().toLowerCase();

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
        console.log(searchResults);
        const searchResultsArr = searchResults.map(result => (
            <button key={result.id} onClick={() => addMember(result)}>
                <p>{`${result.firstname} ${result.lastname}`}</p>
                <p>{`@${result.username}`}</p>
            </button>
        ));
        return searchResultsArr;
    };

    function addMember(member: memberInterface) {

    };

    return (
        <section>
            <h2>Members</h2>
            <section>
                <h3>Current</h3>
            </section>
            <section>
                <h3>Pending</h3>
            </section>
            <button type="button" onClick={() => setSearchMembersVis(!searchMembersVis)}>Add member</button>
            {searchMembersVis ? 
                <>
                    <form>
                        <label htmlFor="search-members">Search by username</label>
                        <input type="text" id="search-members" value={search} onChange={handleSearchMemberChange} />
                        <button type="submit">Search</button>
                    </form>
                    {generateSearchResults()}
                    {numExtra ?
                        <p>{`+${numExtra} results`}</p> : null
                    } 
                </>: 
                null
            }
        </section>
    );
};

export default MemberGroup;
