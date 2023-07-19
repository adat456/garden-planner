import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetUserQuery, useGetEventsQuery, useGetBedsQuery } from "../../app/apiSlice";
import { bedDataInterface, eventInterface, userInterface } from "../../app/interfaces";
import EventOverview from "./EventOverview";
import EventForm from "./Form/EventForm";

const EventsGroup: React.FC = function() {
    const [ eventOverviewVis, setEventOverviewVis ] = useState(false);
    const [ eventFormVis, setEventFormVis ] = useState(false);
    const [ currentEvent, setCurrentEvent ] = useState<eventInterface | null>(null);

    const { bedid } = useParams();
    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;

    const userResult = useGetUserQuery(undefined);
    const user = userResult.data as userInterface;

    const eventsResult = useGetEventsQuery(bedid);
    const events = eventsResult?.data as eventInterface[];
    const sortedFilteredEvents = useMemo(() => {
        const filteredEvents = events?.filter(event => {
            // will show event if you are the event creator or if the event is public
            if (event?.creatorid === user?.id) return event;
            if (event?.eventpublic === "public") return event;

            // but if the event is only open to all members or some members, need to check if your id is on a list first
            let returningEvent;
            if (event?.eventpublic === "allmembers") {
                bed?.members.forEach(member => {
                    if (member.id === user?.id) returningEvent = event;
                });
            };
            if (event?.eventpublic === "somemembers") {
                event?.eventparticipants?.forEach(participant => {
                    if (participant.id === user?.id) returningEvent = event;
                });
            };
            return returningEvent;
        });
        const sortedEvents = filteredEvents?.slice();
        sortedEvents?.sort((a, b) => {
            return new Date(a.eventdate[0]) - new Date(b.eventdate[0]);
        });
        const firstFiveEvents = sortedEvents?.slice(0, 5);
        return firstFiveEvents;
    }, [events]);

    function generateEvents() {
        const eventsArr = sortedFilteredEvents?.map(event => (
            <li key={event.id}>
                <p>{`Event id: ${event.id}`}</p>
                <p>{`Repeat id: ${event.repeatid}`}</p>
                <h3>{event.eventname}</h3>
                <p>{`Located at: ${event.eventlocation}`}</p>
                <p>{`${event.eventdate[0]} ${event.eventdate[1] ? `- ${event.eventdate[1]}` : ""}`}</p>
                <p>{`${event.eventstarttime} ${event.eventendtime ? `- ${event.eventendtime}` : ""}`}</p>
                <button type="button" onClick={() => {setCurrentEvent(event); setEventOverviewVis(true)}}>View event details</button>
            </li>
        ));
        return eventsArr;
    };

    useEffect(() => {
        if (eventOverviewVis) {
            const eventOverview: HTMLDialogElement | null = document.querySelector(".event-overview");
            eventOverview?.showModal();
        };
        if (eventFormVis) {
            const eventForm: HTMLDialogElement | null = document.querySelector(".event-form");
            eventForm?.showModal();
            console.log(currentEvent);
        };
    }, [eventFormVis, eventOverviewVis]);

    return (
        <section>
            <h2>Upcoming Events</h2>
            <ul>
                {generateEvents()}
            </ul>
            <button type="button" onClick={() => setEventFormVis(true)}>Add new event</button>
            <Link to={`/share/${bedid}/events`}>See all events</Link>

            {eventOverviewVis ? <EventOverview setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
            {eventFormVis ? <EventForm setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
        </section>
    );
};

export default EventsGroup;