import { useState } from "react";
import { useParams } from "react-router-dom";
import cloneDeep from "lodash/fp/cloneDeep";
import { nanoid } from "@reduxjs/toolkit";
import { useGetUserQuery, useGetBedsQuery, useGetEventsQuery, useAddEventMutation, useDeleteEventMutation, useAddNotificationMutation } from "../../../app/apiSlice";
import { userInterface, eventInterface, bedDataInterface } from "../../../app/interfaces";
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
    const [ tags, setTags ] = useState<string[]>(currentEvent?.tags || [])

    const { bedid } = useParams();

    const userResult = useGetUserQuery(undefined);
    const user = userResult.data as userInterface;
    const eventsResult = useGetEventsQuery(bedid);
    const events = eventsResult?.data as eventInterface[];
    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;

    const [ addEvent, { isLoading: addEventIsLoading } ] = useAddEventMutation();
    const [ deleteEvent, { isLoading: deleteEventIsLoading } ] = useDeleteEventMutation();
    const [ addNotification, { isLoading: addNotificationIsLoading } ] = useAddNotificationMutation();

    // where interval is the number of days between repeating events, e.g., 7, 14, 28, and single refers to whether the event is a single or multi day affair
    function generateRepeatingDates(interval: number, repeatTillDate: Date, arr: Date[][], single: boolean) {
        const timeDifference = repeatTillDate.getTime() - new Date(eventDate[0]).getTime();
        const dayDifference = timeDifference / (1000 * 3600 * 24);
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

    async function createEvent(eventDates: Date[], repeatId?: string) {
        if (!addEventIsLoading && !addNotificationIsLoading) {
            const preppedEventDate = eventDates.map(date => {
                if (date) {
                    return date.toString().slice(0, 15);
                } else {
                    return "";
                };
            });
            const id = nanoid();

            try {
                await addEvent({
                    bedid,
                    event: {
                        id,
                        creatorId: user?.id,
                        creatorUsername: user?.username,
                        creatorName: `${user?.firstname} ${user?.lastname}`,
                        eventName, eventDesc, eventLocation, eventPublic, eventParticipants,
                        eventDate: preppedEventDate,
                        eventStartTime, eventEndTime, repeating, repeatEvery, repeatTill, repeatId, rsvpNeeded, rsvpDate, tags
                    },
                }).unwrap();

                // send notifications to all members
                if (rsvpNeeded && eventPublic === "allmembers") {
                    bed?.members.forEach(async member => {
                        await addNotification({
                            senderid: user?.id,
                            sendername: `${user?.firstname} ${user?.lastname}`,
                            senderusername: user?.username,
                            recipientid: member.id,
                            message: `${user?.firstname} ${user?.lastname} with ${bed?.name} is hosting ${eventName} on ${eventDate}. Please RSVP by ${rsvpDate}.`,
                            dispatched: new Date().toISOString().slice(0, 10),
                            type: "rsvpinvite",
                            bedid: bed?.id,
                            eventid: id
                        });
                    });
                };

                // send notifications only to invited members
                if (rsvpNeeded && eventPublic === "somemembers" && eventParticipants.length > 0) {
                    eventParticipants.forEach(async participant => {
                        await addNotification({
                            senderid: user?.id,
                            sendername: `${user?.firstname} ${user?.lastname}`,
                            senderusername: user?.username,
                            recipientid: participant.id,
                            message: `${user?.firstname} ${user?.lastname} with ${bed?.name} is hosting ${eventName} on ${eventDate}. Please RSVP by ${rsvpDate}.`,
                            dispatched: new Date().toISOString().slice(0, 10),
                            type: "rsvpinvite",
                            bedid: bed?.id,
                            eventid: id
                        });
                    });
                };
            } catch(err) {
                console.error("Unable to add event: ", err.message);
            };
        };
    };

    async function handleCreateEvent(e?: React.FormEvent<HTMLFormElement>) {
        e?.preventDefault();

        if (!repeating) {
            createEvent(eventDate);
        };        
        if (repeating && repeatEvery && repeatTill) {
            const repeatingDatesArr = generateRepeatingDatesCircumstantially();
            const repeatId = nanoid();
            repeatingDatesArr.forEach(async (dateArr) => {
                createEvent(dateArr, repeatId);
            });
        };

        handleCloseEventForm();
        setCurrentEvent(null);
    };

    // unlike other updates, below functions actually just create new events and delete the outdated ones (appears to be a more straightforward solution, especially if the repeating status, repeat till, and/or repeat every inputs are edited)
    async function handleUpdateEvent() {
        // same code as in handleCreateEvent, except without the closing of the form and the nullifying of the current event
        if (!repeating) {
            createEvent(eventDate);
        };  
        if (repeating && repeatEvery && repeatTill) {
            const repeatingDatesArr = generateRepeatingDatesCircumstantially();
            const repeatId = nanoid();
            repeatingDatesArr.forEach(async (dateArr) => {
                createEvent(dateArr, repeatId);
            });
        };

        try {
            await deleteEvent({
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
            <form method="POST" onSubmit={!currentEvent ? handleCreateEvent : undefined}>
                <h3>Create new event</h3>
                <EventDetailsFieldset eventName={eventName} setEventName={setEventName} eventDesc={eventDesc} setEventDesc={setEventDesc} eventLocation={eventLocation} setEventLocation={setEventLocation} eventPublic={eventPublic} setEventPublic={setEventPublic} rsvpNeeded={rsvpNeeded} setRsvpNeeded={setRsvpNeeded} rsvpDate={rsvpDate} setRsvpDate={setRsvpDate}participantSearch={participantSearch} setParticipantSearch={setParticipantSearch} participantSearchResults={participantSearchResults} setParticipantSearchResults={setParticipantSearchResults} eventParticipants={eventParticipants} setEventParticipants={setEventParticipants} eventDate={eventDate} />
                <EventTimingFieldset eventDate={eventDate} setEventDate={setEventDate} eventStartTime={eventStartTime} setEventStartTime={setEventStartTime} eventEndTime={eventEndTime} setEventEndTime={setEventEndTime} repeating={repeating} setRepeating={setRepeating} repeatTill={repeatTill} setRepeatTill={setRepeatTill} repeatEvery={repeatEvery} setRepeatEvery={setRepeatEvery} /> 
                <EventTags tags={tags} setTags={setTags} currentEvent={currentEvent} />
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