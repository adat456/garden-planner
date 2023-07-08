import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetUserQuery, useAddEventMutation } from "../../app/apiSlice";
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
    const [ eventDate, setEventDate ] = useState<Date[]>([
        new Date(),
        null
    ]);
    const [ eventStartTime, setEventStartTime ] = useState("");
    const [ eventEndTime, setEventEndTime ] = useState("");
    const [ repeating, setRepeating ] = useState(false);
    const [ repeatEvery, setRepeatEvery ] = useState<string>("");
    const [ repeatTill, setRepeatTill ] = useState("");

    const { bedid } = useParams();

    const userResult = useGetUserQuery();
    const user = userResult.data as userInterface;

    const [ addEvent, { isLoading } ] = useAddEventMutation();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const preppedEventDate = eventDate.map(date => {
            if (date) {
                return date.toString().slice(0, 15);
            } else {
                return "";
            };
        });

        if (!isLoading) {
            try {
                await addEvent({
                    bedid,
                    event: {
                        creatorId: user?.id,
                        creatorUsername: user?.username,
                        creatorName: `${user?.firstname} ${user?.lastname}`,
                        eventName, eventDesc, eventLocation, eventPublic, eventParticipants,
                        eventDate: preppedEventDate,
                        eventStartTime, eventEndTime, repeating, repeatEvery, repeatTill
                    },
                }).unwrap();
            } catch(err) {
                console.error("Unable to add event: ", err.message);
            };
        };
    };

    return (
        <form method="POST" onSubmit={handleSubmit}>
            <h3>Create new event</h3>
            <EventDetailsFieldset eventName={eventName} setEventName={setEventName} eventDesc={eventDesc} setEventDesc={setEventDesc} eventLocation={eventLocation} setEventLocation={setEventLocation} eventPublic={eventPublic} setEventPublic={setEventPublic} participantSearch={participantSearch} setParticipantSearch={setParticipantSearch} participantSearchResults={participantSearchResults} setParticipantSearchResults={setParticipantSearchResults} eventParticipants={eventParticipants} setEventParticipants={setEventParticipants} />
            <EventTimingFieldset eventDate={eventDate} setEventDate={setEventDate} eventStartTime={eventStartTime} setEventStartTime={setEventStartTime} eventEndTime={eventEndTime} setEventEndTime={setEventEndTime} repeating={repeating} setRepeating={setRepeating} repeatTill={repeatTill} setRepeatTill={setRepeatTill} repeatEvery={repeatEvery} setRepeatEvery={setRepeatEvery} /> 
            <button type="submit">Add to calendar</button> 
        </form>
    )
};

export default EventForm;