import EventForm from "./EventForm";

const EventsGroup: React.FC = function() {
    return (
        <section>
            <h2>Upcoming Events</h2>
            <EventForm />
        </section>
    );
};

export default EventsGroup;