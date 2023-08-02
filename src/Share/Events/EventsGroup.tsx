import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetUserQuery, useGetEventsQuery, useGetBedsQuery, useGetPersonalPermissionsQuery } from "../../app/apiSlice";
import { useWrapRTKQuery } from "../../app/customHooks";
import { bedDataInterface, eventInterface, userInterface } from "../../app/interfaces";
import EventOverview from "./EventOverview";
import EventForm from "./Form/EventForm";
import EventPreview from "./EventPreview";

const EventsGroup: React.FC = function() {
    const [ eventOverviewVis, setEventOverviewVis ] = useState(false);
    const [ eventFormVis, setEventFormVis ] = useState(false);
    const [ currentEvent, setCurrentEvent ] = useState<eventInterface | null>(null);

    const { bedid } = useParams();

    const { data: bedObject } = useWrapRTKQuery(useGetBedsQuery);
    const bed = bedObject?.find(bed => bed.id === Number(bedid)) as bedDataInterface;
    const { data: userResult } = useWrapRTKQuery(useGetUserQuery);
    const user = userResult as userInterface;
    const { data: permissionsData } = useWrapRTKQuery(useGetPersonalPermissionsQuery, bedid);
    const personalPermissions = permissionsData as string[];
    const { data: eventsResult } = useWrapRTKQuery(useGetEventsQuery, bedid);
    const events = eventsResult as eventInterface[];

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
            <EventPreview key={event.id} event={event} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} />
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
            <Link to={`/share/${bedid}/events`}>See all events</Link>

            {eventOverviewVis ? <EventOverview setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
            {eventFormVis ? <EventForm setEventFormVis={setEventFormVis} currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} /> : null}
        </section>
    );
};

export default EventsGroup;