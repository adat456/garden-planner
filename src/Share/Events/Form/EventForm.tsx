import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import cloneDeep from "lodash/fp/cloneDeep";
import { nanoid } from "@reduxjs/toolkit";
import { format, differenceInDays } from "date-fns";
import { prepEventDateForDisplay, prepHyphenatedDateForDisplay } from "../../../app/helpers";
import { useGetUserQuery, useGetBedsQuery, useGetEventsQuery, useAddEventMutation, useDeleteEventMutation, useAddNotificationMutation } from "../../../app/apiSlice";
import { useWrapRTKMutation, useWrapRTKQuery } from "../../../app/customHooks";
import { userInterface, eventInterface, bedDataInterface, membersInterface } from "../../../app/interfaces";
import EventDetailsFieldset from "./EventDetailsFieldset";
import EventTimingFieldset from "./EventTimingFieldset";
import EventTags from "./EventTags";

interface eventParticipantsInterface {
    id: number,
    username: string,
    name: string,
};

interface eventFormInterface {
    setEventFormVis: React.Dispatch<React.SetStateAction<boolean>>,
    setEventOverviewVis: React.Dispatch<React.SetStateAction<boolean>>,
    currentEvent?: eventInterface | null,
    setCurrentEvent: React.Dispatch<React.SetStateAction<eventInterface | null>>
};

const EventForm: React.FC<eventFormInterface> = function({ setEventFormVis, currentEvent, setCurrentEvent, setEventOverviewVis }) {
    const [ eventName, setEventName ] = useState(currentEvent?.eventname || "");
    const [ eventDesc, setEventDesc ] = useState(currentEvent?.eventdesc || "");
    const [ eventLocation, setEventLocation ] = useState(currentEvent?.eventlocation || "");
    const [ eventPublic, setEventPublic ] = useState<string>(currentEvent?.eventpublic || "allmembers");
    const [ rsvpNeeded, setRsvpNeeded ] = useState(currentEvent?.rsvpneeded || false);
    const [ rsvpDate, setRsvpDate ] = useState<Date | null>(currentEvent?.rsvpdate || "");
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
    const [ tags, setTags ] = useState<string[]>(currentEvent?.tags || []);

    const [ submitTrigger, setSubmitTrigger ] = useState(0);
    const [ errMsgs, setErrMsgs ] = useState<{field: string, msg: string}[]>([]);

    const formRef = useRef<HTMLFormElement>(null);
    
    const { bedid } = useParams();

    const { data: userResult } = useWrapRTKQuery(useGetUserQuery);
    const user = userResult as userInterface;
    const { data: eventsResult } = useWrapRTKQuery(useGetEventsQuery, bedid);
    const events = eventsResult as eventInterface[];
    const { data: bedObject } = useWrapRTKQuery(useGetBedsQuery);
    const bed = bedObject?.find(bed => bed.id === Number(bedid)) as bedDataInterface;

    const { mutation: addEvent, isLoading: addEventIsLoading } = useWrapRTKMutation(useAddEventMutation);
    const { mutation: deleteEvent, isLoading: deleteEventIsLoading } = useWrapRTKMutation(useDeleteEventMutation);
    const { mutation: addNotification, isLoading: addNotificationIsLoading } = useWrapRTKMutation(useAddNotificationMutation);

    // where interval is the number of days between repeating events, e.g., 7, 14, 28, and single refers to whether the event is a single or multi day affair
    function generateRepeatingDates(interval: number, repeatTillDate: Date, arr: Date[][], single: boolean) {
        const dayDifference = differenceInDays(new Date(repeatTillDate), new Date(eventDate[0])) + 1;
        const numTimeIntervals = Math.floor(dayDifference / interval);

        // adding the appropriate number of days to each date/set of dates based on the iteration number
        for (let i = 0; i <= numTimeIntervals; i++) {
            const numDaysAhead = interval * i;
            if (single) {
                const eventDate0Clone = cloneDeep(new Date(eventDate[0]));

                arr.push([new Date(eventDate0Clone.setDate(eventDate0Clone.getDate() + numDaysAhead)), ""]);
            } else {
                const eventDate0Clone = cloneDeep(new Date(eventDate[0]));
                const eventDate1Clone = cloneDeep(new Date(eventDate[1]));
                
                arr.push([new Date(eventDate0Clone.setDate(eventDate0Clone.getDate() + numDaysAhead)), new Date(eventDate1Clone.setDate(eventDate1Clone.getDate() + numDaysAhead))])
            };
        };
    };

    function generateRepeatingDatesCircumstantially() {
        let repeatingDatesArr: Date[][] = [];
        const repeatTillDate = new Date(repeatTill);
        // above is necessary because "time" inputs only return a string

        switch(repeatEvery) {
            case "weekly":
                if (eventDate[1]) {
                    generateRepeatingDates(7, repeatTillDate, repeatingDatesArr, false);
                } else {
                    generateRepeatingDates(7, repeatTillDate, repeatingDatesArr, true);
                };
                break;
            case "biweekly":
                if (eventDate[1]) {
                    generateRepeatingDates(14, repeatTillDate, repeatingDatesArr, false);
                } else {
                    generateRepeatingDates(14, repeatTillDate, repeatingDatesArr, true);
                };
                break;
            case "monthly":
                if (eventDate[1]) {
                    generateRepeatingDates(28, repeatTillDate, repeatingDatesArr, false);
                } else {
                    generateRepeatingDates(28, repeatTillDate, repeatingDatesArr, true);
                };
                break;
        };

        return repeatingDatesArr;
    };

    async function createEvent(eventId: string, eventDate: Date[], repeatId?: string) {
        if (!addEventIsLoading) {
            try {
                setSubmitTrigger(submitTrigger + 1);
                if (!formRef.current?.checkValidity()) throw new Error("Some fields are no good!");

                await addEvent({
                    bedid,
                    event: {
                        id: eventId,
                        creatorId: user?.id,
                        creatorUsername: user?.username,
                        creatorName: `${user?.firstname} ${user?.lastname}`,
                        eventName, eventDesc, eventLocation, eventPublic, eventParticipants,
                        eventDate, eventStartTime, eventEndTime, repeating, repeatEvery, repeatTill, repeatId, rsvpNeeded, rsvpDate, tags
                    },
                }).unwrap();

                handleCloseEventForm();
                setCurrentEvent(null);
            } catch(err) {
                if (err.message) console.error("Unable to add event: ", err.message);
                if (typeof err.data === "string") console.error("Unable to add event:", err.data);
                if (typeof err.data !== "string") setErrMsgs(err.data);
            };
        };
    };

    async function sendNotification(eventId: string, inviteeId: number) {
        if (!addNotificationIsLoading) {
            try {
                await addNotification({
                    senderid: user?.id,
                    sendername: `${user?.firstname} ${user?.lastname}`,
                    senderusername: user?.username,
                    recipientid: inviteeId,
                    message: `${user?.firstname} ${user?.lastname} with ${bed?.name} is hosting ${eventName} on ${eventDate}. Please RSVP by ${rsvpDate}.`,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "rsvpinvite",
                    bedid: bed?.id,
                    eventid: eventId,
                    eventname: eventName,
                    eventdate: eventDate,
                    rsvpdate: rsvpDate,
                });
            } catch(err) {
                console.log(err.data);
            };
        };
    };

    async function handleCreateEvent(e?: React.FormEvent<HTMLFormElement>) {
        e?.preventDefault();

        try {
            if (!repeating) {
                const eventId = nanoid();
                createEvent(eventId, eventDate);

                if (rsvpNeeded && eventPublic === "allmembers") {
                    bed?.members.forEach(async member => sendNotification(eventId, member.id));
                };
                if (rsvpNeeded && eventPublic === "somemembers" && eventParticipants.length > 0) {
                    eventParticipants.forEach(async participant => sendNotification(eventId, participant.id));
                };
            };        

            if (repeating) {
                const repeatingDatesArr = generateRepeatingDatesCircumstantially();
                if (repeatingDatesArr.length == 0) {
                    setSubmitTrigger(submitTrigger + 1);
                    if (!formRef.current?.checkValidity()) throw new Error("Some fields are no good!");
                };

                const repeatId = nanoid();
                repeatingDatesArr.forEach(async (dateArr) => {
                    const eventId = nanoid();
                    createEvent(eventId, dateArr, repeatId);

                    if (rsvpNeeded && eventPublic === "allmembers") {
                        bed?.members.forEach(async member => sendNotification(eventId, member.id));
                    };
                    if (rsvpNeeded && eventPublic === "somemembers" && eventParticipants.length > 0) {
                        eventParticipants.forEach(async participant => sendNotification(eventId, participant.id));
                    };
                });
            };
        } catch(err) {
            console.error("weh");
        };
    };

    // unlike other updates, below functions actually just create new events and delete the outdated ones (appears to be a more straightforward solution, especially if the repeating status, repeat till, and/or repeat every inputs are edited)
    async function handleUpdateEvent() {
        // same code as in handleCreateEvent, except without the closing of the form and the nullifying of the current event
        if (!repeating) {
            const eventId = nanoid();
            createEvent(eventId, eventDate);
        };  
        if (repeating && repeatEvery && repeatTill) {
            const repeatingDatesArr = generateRepeatingDatesCircumstantially();
            const repeatId = nanoid();
            repeatingDatesArr.forEach(async (dateArr) => {
                const eventId = nanoid();
                createEvent(eventId, dateArr, repeatId);
            });
        };

        try {
            await deleteEvent({
                bedid,
                eventid: currentEvent?.id,
            }).unwrap();
        } catch(err) {
            console.error("Unable to delete all repeating events: ", err.message);
        };

        handleCloseEventForm();
        setCurrentEvent(null);
    };
    // modifies the current event and all of the events that follow
    async function handleUpdateAllRepeatingEvents() {   
        if (repeating && repeatEvery && repeatTill) {
            const repeatingDatesArr = generateRepeatingDatesCircumstantially();
            // preserves current event's repeat id
            repeatingDatesArr.forEach(async (dateArr) => {
                createEvent(dateArr, currentEvent?.repeatid);
            });
        };

        // all of the repeating events to be deleted now that new ones have been created
        const allRepeatingEventsTBD = events?.filter(event => event.repeatid === currentEvent?.repeatid && event.id >= currentEvent?.id);
        console.log(allRepeatingEventsTBD);
        allRepeatingEventsTBD.forEach(async (event) => {
            if (currentEvent && !deleteEventIsLoading) {
                try {
                    await deleteEvent({
                        eventid: event.id,
                    }).unwrap();
                } catch(err) {
                    console.error("Unable to delete all repeating events: ", err.message);
                };
            };
        });

        handleCloseEventForm();
        setCurrentEvent(null);
    };

    function handleCloseEventForm() {
        const eventForm: HTMLDialogElement | null = document.querySelector(".event-form");
        eventForm?.close();
        setEventFormVis(false);
    };

    function handleBackToOverview() {
        handleCloseEventForm();
        setEventOverviewVis(true);
    };

    return (
        <dialog className="event-form">
            <button type="button" onClick={handleBackToOverview}>Back to overview</button>
            <form method="POST" ref={formRef} onSubmit={!currentEvent ? handleCreateEvent : undefined} noValidate>
                <h3>Create new event</h3>
                <EventDetailsFieldset eventName={eventName} setEventName={setEventName} eventDesc={eventDesc} setEventDesc={setEventDesc} eventLocation={eventLocation} setEventLocation={setEventLocation} eventPublic={eventPublic} setEventPublic={setEventPublic} rsvpNeeded={rsvpNeeded} setRsvpNeeded={setRsvpNeeded} rsvpDate={rsvpDate} setRsvpDate={setRsvpDate}participantSearch={participantSearch} setParticipantSearch={setParticipantSearch} participantSearchResults={participantSearchResults} setParticipantSearchResults={setParticipantSearchResults} eventParticipants={eventParticipants} setEventParticipants={setEventParticipants} eventDate={eventDate} submitTrigger={submitTrigger} errMsgs={errMsgs} />
                <EventTimingFieldset eventDate={eventDate} setEventDate={setEventDate} eventStartTime={eventStartTime} setEventStartTime={setEventStartTime} eventEndTime={eventEndTime} setEventEndTime={setEventEndTime} repeating={repeating} setRepeating={setRepeating} repeatTill={repeatTill} setRepeatTill={setRepeatTill} repeatEvery={repeatEvery} setRepeatEvery={setRepeatEvery} submitTrigger={submitTrigger} errMsgs={errMsgs} /> 
                <EventTags tags={tags} setTags={setTags} currentEvent={currentEvent} submitTrigger={submitTrigger} errMsgs={errMsgs} />
                <button type="button" onClick={() => {handleCloseEventForm(); setCurrentEvent(null)}}>Close</button>
                {currentEvent?
                    <>
                        <button type="button" onClick={handleUpdateEvent}>Update</button>
                        {currentEvent?.repeating ?
                            <button type="button" onClick={handleUpdateAllRepeatingEvents}>Update this event and all repeating events</button> : null
                        }
                    </> :
                    <button type="submit">Add to calendar</button> 
                }
            </form>
        </dialog>
    )
};

export default EventForm;