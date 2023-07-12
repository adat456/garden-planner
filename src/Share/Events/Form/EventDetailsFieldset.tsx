import { useParams } from "react-router-dom";
import { useGetBedsQuery } from "../../../app/apiSlice";
import { eventParticipantInterface, bedDataInterface } from "../../../app/interfaces";

interface eventDetailsFieldsetInterface {
    eventName: string,
    setEventName: React.Dispatch<React.SetStateAction<string>>,
    eventDesc: string,
    setEventDesc: React.Dispatch<React.SetStateAction<string>>,
    eventLocation: string,
    setEventLocation: React.Dispatch<React.SetStateAction<string>>,
    eventPublic: boolean,
    setEventPublic: React.Dispatch<React.SetStateAction<boolean>>,
    participantSearch: string,
    setParticipantSearch: React.Dispatch<React.SetStateAction<string>>,
    participantSearchResults: eventParticipantInterface[],
    setParticipantSearchResults: React.Dispatch<React.SetStateAction<eventParticipantInterface[]>>,
    eventParticipants: eventParticipantInterface[],
    setEventParticipants: React.Dispatch<React.SetStateAction<eventParticipantInterface[]>>,
};

const EventDetailsFieldset: React.FC<eventDetailsFieldsetInterface> = function({ eventName, setEventName, eventDesc, setEventDesc, eventLocation, setEventLocation, eventPublic, setEventPublic, participantSearch, setParticipantSearch, participantSearchResults, setParticipantSearchResults, eventParticipants, setEventParticipants}) {
    
    const { bedid } = useParams();
    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;

    function handleEventPublic() {
        if (!eventPublic) {
            setParticipantSearch("");
            setParticipantSearchResults([]);
            setEventParticipants([]);
        };

        setEventPublic(!eventPublic);
    };

    function handleParticipantSearchChange(e: React.FormEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        setParticipantSearch(input.value);

        const trimmedInputValue = input.value.trim().toLowerCase();
        console.log(bed);

        setParticipantSearchResults(bed?.members?.filter(member => member.name.toLowerCase().includes(trimmedInputValue) || member.username.toLowerCase().includes(trimmedInputValue)))
    };

    function generateParticipantSearchResults() {
        let results;
        if (participantSearchResults.length > 0) {
            results = participantSearchResults.map(participant => (
                <li key={`participant-search-result-${participant.id}`}>
                    <button type="button" onClick={() => addParticipant(participant.id, participant.name, participant.username)}>Add</button>
                    <p>{participant.name}</p>
                    <p>{participant.username}</p>
                </li>
            ));
        } else {
            results = <p>No matching members found.</p>
        };
        return results;
    };
    function addParticipant(id: number, name: string, username: string) {
        setEventParticipants([...eventParticipants, { id, name, username }]);
    };

    function generateParticipants() {
        let participantsArr = eventParticipants?.map(participant => (
            <li key={`participant-${participant.id}`}>
                <button type="button" onClick={() => removeParticipant(participant.id)}>Remove</button>
                <p>{participant.name}</p>
                <p>{participant.username}</p>
            </li>
        ));
        return participantsArr;
    };
    function removeParticipant(id: number) {
        setEventParticipants(eventParticipants.filter(participant => participant.id !== id));
    };  

    return (
        <>
            <div>
                <label htmlFor="eventName">Name</label>
                <input type="text" id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} />
            </div>
            <div>
                <label htmlFor="eventDesc">Description</label>
                <textarea id="eventDesc" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} />
            </div>
            <div>
                <label htmlFor="eventLocation">Location</label>
                <input type="text" id="eventLocation" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
            </div>
            <div>
                <input type="checkbox" id="eventPublic" checked={eventPublic} onChange={handleEventPublic} />
                <label htmlFor="eventPublic">Open to the public</label>
            </div>
            {!eventPublic ?
                <>
                    <h4>Added participants</h4>
                    {generateParticipants()}
                    <div>
                        <label htmlFor="participantSearch">Add participants</label>
                        <input type="text" id="participantSearch" value={participantSearch} onChange={handleParticipantSearchChange} /> 
                    </div>
                    {generateParticipantSearchResults()}
                </>: 
                null
            }
        </>
    );
};

export default EventDetailsFieldset;