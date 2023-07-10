import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetEventsQuery } from "../../app/apiSlice";
import { eventInterface } from "../../app/interfaces";
import EventForm from "./EventForm";

const EventsGroup: React.FC = function() {
    const [ eventFormVis, setEventFormVis ] = useState(false);
    const [ currentEvent, setCurrentEvent ] = useState<eventInterface | null>(null)

    let { bedid } = useParams();

    const eventsResult = useGetEventsQuery(bedid);
    const events = eventsResult?.data as eventInterface[];

    function generateEvents() {
        const eventsArr = events?.map(event => (
            <li key={event.id}>
                <h3>{event.eventname}</h3>
                <p>{`Located at: ${event.eventlocation}`}</p>
                <p>{`${event.eventdate[0]} ${event.eventdate[1] ? `- ${event.eventdate[1]}` : ""}`}</p>
                <p>{`${event.eventstarttime} ${event.eventendtime ? `- ${event.eventendtime}` : ""}`}</p>
                <button type="button" onClick={() => {setCurrentEvent(event); setEventFormVis(true)}}>Edit</button>
            </li>
        ));
        return eventsArr;
    };

    useEffect(() => {
        if (eventFormVis) {
            const eventForm: HTMLDialogElement | null = document.querySelector(".event-form");
            eventForm?.showModal();
        };
    }, [eventFormVis]);

    return (
        <section>
            <h2>Upcoming Events</h2>
            <ul>
                {generateEvents()}
            </ul>
            <button type="button" onClick={() => setEventFormVis(true)}>Add new event</button>
            {eventFormVis ? <EventForm setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} /> : null}
        </section>
    );
};

export default EventsGroup;