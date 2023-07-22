import { eventInterface } from "../../app/interfaces";
import { prepEventDateForDisplay, convert24to12 } from "../../app/helpers";

interface eventPreviewInterface {
    event: eventInterface
    setCurrentEvent: React.Dispatch<React.SetStateAction<eventInterface | null>>,
    setEventOverviewVis: React.Dispatch<React.SetStateAction<boolean>>,
};

const EventPreview: React.FC<eventPreviewInterface> = function({ event, setCurrentEvent, setEventOverviewVis }) {
    return (
        <li key={event.id}>
            <h3>{event.eventname}</h3>
            <p>{`${prepEventDateForDisplay(event.eventdate[0])} ${event.eventdate[1] ? `- ${prepEventDateForDisplay(event.eventdate[1])}` : ""}`}</p>
            <p>{`${event.eventstarttime ? `${convert24to12(event.eventstarttime)}` : ""} ${event.eventendtime ? `- ${convert24to12(event.eventendtime)}` : ""}`}</p>
            <button type="button" onClick={() => {setCurrentEvent(event); setEventOverviewVis(true)}}>View event details</button>
        </li>
    );
};

export default EventPreview;