import { useState } from "react";
import { useParams } from "react-router-dom";
import cloneDeep from "lodash/fp/cloneDeep";
import { nanoid } from "@reduxjs/toolkit";
import { useGetUserQuery, useAddEventMutation, useUpdateEventMutation, useDeleteEventMutation } from "../../app/apiSlice";
import { userInterface, eventInterface } from "../../app/interfaces";
import EventDetailsFieldset from "./EventDetailsFieldset";
import EventTimingFieldset from "./EventTimingFieldset";

interface eventParticipantsInterface {
    id: number,
    username: string,
    name: string,
};

interface eventFormInterface {
    setEventFormVis: React.Dispatch<React.SetStateAction<boolean>>,
    currentEvent?: eventInterface | null,
    setCurrentEvent: React.Dispatch<React.SetStateAction<eventInterface | null>>
}

const EventForm: React.FC<eventFormInterface> = function({ setEventFormVis, currentEvent, setCurrentEvent }) {
    const [ eventName, setEventName ] = useState(currentEvent?.eventname || "");
    const [ eventDesc, setEventDesc ] = useState(currentEvent?.eventdesc || "");
    const [ eventLocation, setEventLocation ] = useState(currentEvent?.eventlocation || "");
    const [ eventPublic, setEventPublic ] = useState<boolean>(currentEvent?.eventpublic || true);
    const [ participantSearch, setParticipantSearch ] = useState("");
    const [ participantSearchResults, setParticipantSearchResults ] = useState<eventParticipantsInterface[]>([]);
    const [ eventParticipants, setEventParticipants ] = useState<eventParticipantsInterface[]>(currentEvent?.eventparticipants || []); 
    const [ eventDate, setEventDate ] = useState<Date[]>(currentEvent?.eventdate || [
        new Date(),
        null
    ]);
    const [ eventStartTime, setEventStartTime ] = useState(currentEvent?.eventstarttime || "");
    const [ eventEndTime, setEventEndTime ] = useState(currentEvent?.eventendtime || "");
    const [ repeating, setRepeating ] = useState(currentEvent?.repeating || false);
    const [ repeatEvery, setRepeatEvery ] = useState<string>(currentEvent?.repeatevery || "");
    const [ repeatTill, setRepeatTill ] = useState(currentEvent?.repeattill || "");

    const { bedid } = useParams();

    const userResult = useGetUserQuery();
    const user = userResult.data as userInterface;

    const [ addEvent, { addEventIsLoading } ] = useAddEventMutation();
    const [ updateEvent, { updateEventIsLoading } ] = useUpdateEventMutation();
    const [ deleteEvent, { deleteEventIsLoading } ] = useDeleteEventMutation();

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

    async function createEvent(eventDates: Date[], repeatId?: string) {
        if (!addEventIsLoading) {
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
                        eventStartTime, eventEndTime, repeating, repeatEvery, repeatTill, repeatId
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
            const repeatId = nanoid();

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
                createEvent(dateArr, repeatId);
            });
        } else {
            createEvent(eventDate);
        };

        handleCloseEventForm();
    };

    async function handleUpdateEvent() {
        if (currentEvent && !updateEventIsLoading) {
            const preppedEventDate = eventDate.map(date => {
                if (date) {
                    return date.toString().slice(0, 15);
                } else {
                    return "";
                };
            });

            try {
                await updateEvent({
                    eventid: currentEvent.id,
                    event: {
                        eventName, eventDesc, eventLocation, eventPublic, eventParticipants,
                        eventDate: preppedEventDate,
                        eventStartTime, eventEndTime, repeating, repeatEvery, repeatTill
                    },
                }).unwrap();
            } catch(err) {
                console.error("Unable to delete all repeating events: ", err.message);
            };
        };
        handleCloseEventForm();
    };
    async function handleUpdateAllRepeatingEvents() {
        if (currentEvent && !updateEventIsLoading) {
            try {
            } catch(err) {
                console.error("Unable to delete all repeating events: ", err.message);
            };
        };
        handleCloseEventForm();
    };

    async function handleDeleteEvent() {
        if (currentEvent && !deleteEventIsLoading) {
            try {
                await deleteEvent({
                    eventid: currentEvent.id,
                }).unwrap();
            } catch(err) {
                console.error("Unable to delete all repeating events: ", err.message);
            };
        };
        handleCloseEventForm();
    };
    async function handleDeleteAllRepeatingEvents() {
        if (currentEvent && !deleteEventIsLoading) {
            try {
                await deleteEvent({
                    eventid: currentEvent.id,
                    repeatid: currentEvent.repeatid
                }).unwrap();
            } catch(err) {
                console.error("Unable to delete all repeating events: ", err.message);
            };
        };
        handleCloseEventForm();
    };

    function handleCloseEventForm() {
        const eventForm: HTMLDialogElement | null = document.querySelector(".event-form");
        eventForm?.close();

        setEventFormVis(false);
        setCurrentEvent(null);
    };

    return (
        <dialog className="event-form">
            <form method="POST" onSubmit={handleSubmit}>
                <button type="button" onClick={handleCloseEventForm}>Close form</button>
                <h3>Create new event</h3>
                <EventDetailsFieldset eventName={eventName} setEventName={setEventName} eventDesc={eventDesc} setEventDesc={setEventDesc} eventLocation={eventLocation} setEventLocation={setEventLocation} eventPublic={eventPublic} setEventPublic={setEventPublic} participantSearch={participantSearch} setParticipantSearch={setParticipantSearch} participantSearchResults={participantSearchResults} setParticipantSearchResults={setParticipantSearchResults} eventParticipants={eventParticipants} setEventParticipants={setEventParticipants} />
                <EventTimingFieldset eventDate={eventDate} setEventDate={setEventDate} eventStartTime={eventStartTime} setEventStartTime={setEventStartTime} eventEndTime={eventEndTime} setEventEndTime={setEventEndTime} repeating={repeating} setRepeating={setRepeating} repeatTill={repeatTill} setRepeatTill={setRepeatTill} repeatEvery={repeatEvery} setRepeatEvery={setRepeatEvery} /> 
                {currentEvent?
                    <>
                        <button type="button" onClick={handleUpdateEvent}>Submit edits</button>
                        <button type="button" onClick={handleDeleteEvent}>Delete this event</button>
                        {currentEvent?.repeating ?
                            <>
                                <button type="button" onClick={handleUpdateAllRepeatingEvents}>Update this event and all repeating events</button>
                                <button type="button" onClick={handleDeleteAllRepeatingEvents}>Delete this event and all repeating events</button>
                            </> : null
                        }
                    </> :
                    <button type="submit">Add to calendar</button> 
                }
            </form>
        </dialog>
    )
};

export default EventForm;