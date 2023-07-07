import { useState } from "react";
import { useGetUserQuery } from "../../app/apiSlice";
import { userInterface } from "../../app/interfaces";
import EventDetailsFieldset from "./EventDetailsFieldset";
import EventTimingFieldset from "./EventTimingFieldset";

interface eventParticipantsInterface {
    id: number,
    username: string,
    name: string,
};

const EventForm: React.FC = function() {
    const [ eventName, setEventName ] = useState("");
    const [ eventDesc, setEventDesc ] = useState("");
    const [ eventLocation, setEventLocation ] = useState("");
    const [ eventPublic, setEventPublic ] = useState(true);
    const [ participantSearch, setParticipantSearch ] = useState("");
    const [ participantSearchResults, setParticipantSearchResults ] = useState<eventParticipantsInterface[]>([]);
    const [ eventParticipants, setEventParticipants ] = useState<eventParticipantsInterface[]>([]);
    
    const [ eventDateStart, setEventDateStart ] = useState("");
    const [ eventDateEnd, setEventDateEnd ] = useState("");
    const [ eventTimeStart, setEventTimeStart ] = useState("");
    const [ eventTimeEnd, setEventTimeEnd ] = useState("");
    const [ repeating, setRepeating ] = useState(false);
    const [ repeatEvery, setRepeatEvery ] = useState<string[]>([]);
    const [ repeatingTill, setRepeatingTill ] = useState("");

    const userResult = useGetUserQuery();
    const user = userResult.data as userInterface;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
    };

    return (
        <form method="POST" onSubmit={handleSubmit}>
            <h3>Create new event</h3>
            <EventDetailsFieldset eventName={eventName} setEventName={setEventName} eventDesc={eventDesc} setEventDesc={setEventDesc} eventLocation={eventLocation} setEventLocation={setEventLocation} eventPublic={eventPublic} setEventPublic={setEventPublic} participantSearch={participantSearch} setParticipantSearch={setParticipantSearch} participantSearchResults={participantSearchResults} setParticipantSearchResults={setParticipantSearchResults} eventParticipants={eventParticipants} setEventParticipants={setEventParticipants} />
            <EventTimingFieldset eventDateStart={eventDateStart} setEventDateStart={setEventDateStart} eventDateEnd={eventDateEnd} setEventDateEnd={setEventDateEnd} eventTimeStart={eventTimeStart} setEventTimeStart={setEventTimeStart} eventTimeEnd={eventTimeEnd} setEventTimeEnd={setEventTimeEnd} repeating={repeating} setRepeating={setRepeating} repeatingTill={repeatingTill} setRepeatingTill={setRepeatingTill} repeatEvery={repeatEvery} setRepeatEvery={setRepeatEvery} /> 
            <button type="submit">Add to calendar</button> 
        </form>
    )
};

export default EventForm;