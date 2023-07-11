import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetUserQuery, useGetEventsQuery } from "../../app/apiSlice";
import { eventInterface } from "../../app/interfaces";
import EventOverview from "./EventOverview";
import EventForm from "./EventForm";

const EventsPage: React.FC = function() {
    const [ eventOverviewVis, setEventOverviewVis ] = useState(false);
    const [ eventFormVis, setEventFormVis ] = useState(false);
    const [ currentEvent, setCurrentEvent ] = useState<eventInterface | null>(null);
    const [ timeFilter, setTimeFilter ] = useState("");
    const [ processedEvents, setProcessedEvents ] = useState<eventInterface[]>([]);

    let { bedid } = useParams();
    const navigate = useNavigate();

    const userResult = useGetUserQuery(undefined);
    const user = userResult.data as userInterface;

    const eventsResult = useGetEventsQuery(bedid);
    const events = eventsResult?.data as eventInterface[];
    const prelimEvents = useMemo(() => {
        const filteredEvents = events?.filter(event => {
            if (event?.creatorid === user?.id) return event;
            if (event?.eventpublic === true) return event;

            let returningEvent;
            event?.eventparticipants?.forEach(participant => {
                if (participant.id === user?.id) returningEvent = event;
            });
            return returningEvent;
        });
        const sortedEvents = filteredEvents?.slice();
        sortedEvents?.sort((a, b) => {
            return new Date(a.eventdate[0]) - new Date(b.eventdate[0]);
        });
        return sortedEvents;
    }, [events]);

    const today = new Date();
    function addDays(date: Date, days: number) {
        const dateCopy = new Date(date);
        dateCopy.setDate(dateCopy.getDate() + days);
        return dateCopy;
    };
    const nextWeek = addDays(today, 7);
    const nextTwoWeeks = addDays(today, 14);
    const nextMonth = addDays(today, 28);

    useEffect(() => {
        let processedEventsArr: eventInterface[] = [];
        if (timeFilter) {
            switch (timeFilter) {
                case "7":
                    processedEventsArr = prelimEvents?.filter(event => {
                        if (new Date(event.eventdate[0]) <= new Date(nextWeek)) return event;
                    });
                    break;
                case "14":
                    processedEventsArr = prelimEvents?.filter(event => new Date(event.eventdate[0]) <= new Date(nextTwoWeeks));
                    break;
                case "28":
                    processedEventsArr = prelimEvents?.filter(event => new Date(event.eventdate[0]) <= new Date(nextMonth));
                    break;
            };
        };
        setProcessedEvents(processedEventsArr);
    }, [timeFilter]);

    function generateEvents(events: eventInterface[]) {
        const eventsArr = events?.map(event => (
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
            <button type="button" onClick={() => navigate(`/share/${bedid}`)}>Return to bed overview</button>
            <h2>Events</h2>
            <label htmlFor="time-filter">See events:</label>
            <select name="time-filter" id="time-filter" defaultValue={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                <option value="">from all time</option>
                <option value="7">in the next 7 days</option>
                <option value="14">in the next 14 days</option>
                <option value="28">in the next 28 days</option>
            </select>
            <ul>
                {(timeFilter) ? generateEvents(processedEvents) : generateEvents(prelimEvents)}
            </ul>
            <button type="button" onClick={() => setEventFormVis(true)}>Add new event</button>

            {eventOverviewVis ? <EventOverview setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
            {eventFormVis ? <EventForm setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
        </section>
    );
};

export default EventsPage;