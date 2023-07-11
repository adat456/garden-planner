import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetEventsQuery } from "../../app/apiSlice";
import { eventInterface } from "../../app/interfaces";
import EventOverview from "./EventOverview";
import EventForm from "./EventForm";

const EventsGroup: React.FC = function() {
    const [ eventOverviewVis, setEventOverviewVis ] = useState(false);
    const [ eventFormVis, setEventFormVis ] = useState(false);
    const [ currentEvent, setCurrentEvent ] = useState<eventInterface | null>(null)

    let { bedid } = useParams();

    const eventsResult = useGetEventsQuery(bedid);
    const events = eventsResult?.data as eventInterface[];
    const sortedEvents = useMemo(() => {
        const sortedEvents = events?.slice();
        sortedEvents?.sort((a, b) => {
            return new Date(a.eventdate[0]) - new Date(b.eventdate[0]);
        });
        return sortedEvents;
    }, [events]);

    function generateEvents() {
        const eventsArr = sortedEvents?.map(event => (
            <li key={event.id}>
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
        };
    }, [eventFormVis, eventOverviewVis]);

    return (
        <section>
            <h2>Upcoming Events</h2>
            <ul>
                {generateEvents()}
            </ul>
            <button type="button" onClick={() => setEventFormVis(true)}>Add new event</button>

            {eventOverviewVis ? <EventOverview setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
            {eventFormVis ? <EventForm setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
        </section>
    );
};

export default EventsGroup;