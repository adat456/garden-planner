import { useParams } from "react-router-dom";
import { useGetEventsQuery } from "../../app/apiSlice";
import { eventInterface } from "../../app/interfaces";
import EventForm from "./EventForm";

const EventsGroup: React.FC = function() {
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
                <button type="button">Edit</button>
            </li>
        ));
        return eventsArr;
    };

    return (
        <section>
            <h2>Upcoming Events</h2>
            <ul>
                {generateEvents()}
            </ul>
            <EventForm />
        </section>
    );
};

export default EventsGroup;