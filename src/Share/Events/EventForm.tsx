import { useState } from "react";
import { useParams } from "react-router-dom";
import cloneDeep from "lodash/fp/cloneDeep";
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

    // where interval is the number of days between repeating events, e.g., 7, 14, 28
    function generateRepeatingDatesForSingleDayEvents(interval: number, repeatTillDate: Date, arr: Date[][]) {
        const timeDifference = repeatTillDate.getTime() - eventDate[0].getTime();
        const dayDifference = timeDifference / (1000 * 3600 * 24);
        const numTimeIntervals = Math.floor(dayDifference / interval);

        for (let i = 0; i <= numTimeIntervals; i++) {
            const numDaysAhead = interval * i;
            const eventDate0Clone = cloneDeep(eventDate[0]);
            
            arr.push([new Date(eventDate0Clone.setDate(eventDate0Clone.getDate() + numDaysAhead)), ""])
        };
    };

    function generateRepeatingDatesForMultiDayEvents(interval: number,
    repeatTillDate: Date, arr: Date[][]) {
        const timeDifference = repeatTillDate.getTime() - eventDate[0].getTime();
        const dayDifference = timeDifference / (1000 * 3600 * 24);
        const numTimeIntervals = Math.floor(dayDifference / interval);

        for (let i = 0; i <= numTimeIntervals; i++) {
            const numDaysAhead = interval * i;
            const eventDate0Clone = cloneDeep(eventDate[0]);
            const eventDate1Clone = cloneDeep(eventDate[1]);
            
            arr.push([new Date(eventDate0Clone.setDate(eventDate0Clone.getDate() + numDaysAhead)), new Date(eventDate1Clone.setDate(eventDate1Clone.getDate() + numDaysAhead))])
        };
    };

    async function createEvent(eventDates: Date[]) {
        if (!isLoading) {
            const preppedEventDate = eventDates.map(date => {
                if (date) {
                    return date.toString().slice(0, 15);
                } else {
                    return "";
                };
            });

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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        let repeatingDatesArr: Date[][] = [];
        const repeatTillDate = new Date(repeatTill);
        // above is necessary because "time" inputs only return a string

        if (repeating && repeatEvery && repeatTillDate) {
            switch(repeatEvery) {
                case "weekly":
                    if (eventDate[1]) {
                        generateRepeatingDatesForMultiDayEvents(7, repeatTillDate, repeatingDatesArr);
                    } else {
                        generateRepeatingDatesForSingleDayEvents(7, repeatTillDate, repeatingDatesArr);
                    };
                    break;
                case "biweekly":
                    if (eventDate[1]) {
                        generateRepeatingDatesForMultiDayEvents(14, repeatTillDate, repeatingDatesArr);
                    } else {
                        generateRepeatingDatesForSingleDayEvents(14, repeatTillDate, repeatingDatesArr);
                    };
                    break;
                case "monthly":
                    if (eventDate[1]) {
                        generateRepeatingDatesForMultiDayEvents(28, repeatTillDate, repeatingDatesArr);
                    } else {
                        generateRepeatingDatesForSingleDayEvents(28, repeatTillDate, repeatingDatesArr);
                    };
                    break;
            };
            
            repeatingDatesArr.forEach(async (dateArr) => {
                createEvent(dateArr);
            });
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