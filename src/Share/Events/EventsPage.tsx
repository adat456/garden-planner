import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetUserQuery, useGetBedsQuery, useGetEventsQuery } from "../../app/apiSlice";
import { eventInterface, userInterface, bedDataInterface } from "../../app/interfaces";
import cloneDeep from "lodash/fp/cloneDeep";
import EventOverview from "./EventOverview";
import EventForm from "./Form/EventForm";

const EventsPage: React.FC = function() {
    const [ eventOverviewVis, setEventOverviewVis ] = useState(false);
    const [ eventFormVis, setEventFormVis ] = useState(false);
    const [ currentEvent, setCurrentEvent ] = useState<eventInterface | null>(null);
    const [ timeFilter, setTimeFilter ] = useState("");
    const [ tagFilters, setTagFilters ] = useState<string[]>([]);
    const [ processedEvents, setProcessedEvents ] = useState<eventInterface[]>([]);

    let { bedid } = useParams();

    const userResult = useGetUserQuery(undefined);
    const user = userResult.data as userInterface;

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;

    const eventsResult = useGetEventsQuery(bedid);
    const events = eventsResult?.data as eventInterface[];
    const prelimEvents = useMemo(() => {
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
        // exit/guard clause - avoids all unnecessary work below if there is a change in the filters, but it is just back to "" or an empty array
        if (!timeFilter && tagFilters.length === 0) return;
        
        let processedEventsArr: eventInterface[] = cloneDeep(prelimEvents);
        if (timeFilter) {
            switch (timeFilter) {
                case "7":
                    processedEventsArr = processedEventsArr?.filter(event => new Date(event.eventdate[0]) <= new Date(nextWeek));
                    break;
                case "14":
                    processedEventsArr = processedEventsArr?.filter(event => new Date(event.eventdate[0]) <= new Date(nextTwoWeeks));
                    break;
                case "28":
                    processedEventsArr = processedEventsArr?.filter(event => new Date(event.eventdate[0]) <= new Date(nextMonth));
                    break;
            };
        };
        if (tagFilters.length > 0) {
            processedEventsArr = processedEventsArr.filter(event => {
                let dings = 0;
                tagFilters.forEach(tag => {
                    if (!event.tags.includes(tag)) dings++;
                });
                if (dings === 0) return event;
            });
        };
        setProcessedEvents(processedEventsArr);
    }, [timeFilter, tagFilters]);

    // need to show visually that the tag has been selected
    function generateTagFilters() {
        const tagFilters = bed?.eventtags?.map(tag => (
            <button type="button" key={tag} onClick={() => toggleTagFilter(tag)}>{tag}</button>
        ));
        return tagFilters;
    };

    function toggleTagFilter(tag: string) {
        if (tagFilters.includes(tag)) {
            setTagFilters(tagFilters.filter(tagFilter => tagFilter !== tag));
        } else {
            setTagFilters([...tagFilters, tag]);
        };
    };

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
            <Link to={`/share/${bedid}`}>Return to bed overview</Link>
            <h2>Events</h2>
            <label htmlFor="time-filter">See events:</label>
            <select name="time-filter" id="time-filter" defaultValue={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                <option value="">from all time</option>
                <option value="7">in the next 7 days</option>
                <option value="14">in the next 14 days</option>
                <option value="28">in the next 28 days</option>
            </select>
            <p>Filter by tag(s):</p>
            {generateTagFilters()}
            <ul>
                {(timeFilter || tagFilters.length > 0) ? generateEvents(processedEvents) : generateEvents(prelimEvents)}
            </ul>
            <button type="button" onClick={() => setEventFormVis(true)}>Add new event</button>

            {eventOverviewVis ? <EventOverview setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
            {eventFormVis ? <EventForm setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
        </section>
    );
};

export default EventsPage;