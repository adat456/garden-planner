import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bedDataInterface, eventInterface } from "../../app/interfaces";
import Grid from "../../Base/Grid";
import EventPreview from "../../Share/Events/EventPreview";
import ModifiedEventOverview from "./ModifiedEventOverview";
import RelatedBeds from "./RelatedBeds";

const BedResultPage: React.FC = function() {
    const [ bedData, setBedData ] = useState<bedDataInterface | null>(null);
    const [ events, setEvents ] = useState<eventInterface[]>([]);
    const [ currentEvent, setCurrentEvent ] = useState<eventInterface | null>(null);
    const [ eventOverviewVis, setEventOverviewVis ] = useState(false);

    const [ eventsErrMsg, setEventsErrMsg ] = useState("");
    const [ bedDataErrMsg, setBedDataErrMsg ] = useState("");

    const { bedid } = useParams();

    async function fetchBedData(bedid: string) {
        try {
            const req = await fetch(`http://localhost:3000/one-public-bed/${bedid}`, { credentials: "include" });
            const res = await req.json();
            if (req.ok) {
                setBedData(res);
                setBedDataErrMsg("");
            } else {
                throw new Error(res);
            };
        } catch(err) {
            setBedData(undefined);
            setBedDataErrMsg(err.message);
        };
    };

    async function fetchEvents(bedid: string) {
        try {
            const req = await fetch(`http://localhost:3000/pull-events/${bedid}`, { credentials: "include" });
            const res = await req.json();
            if (req.ok) {
                console.log(res);
                setEvents(res);
                setEventsErrMsg("");
            } else {
                throw new Error(res);
            };
        } catch(err) {
            setEvents([]);
            setEventsErrMsg(err.message);
        };
    };

    useEffect(() => {
        if (bedid && !bedData) fetchBedData(bedid);
        if (bedid && events.length === 0) fetchEvents(bedid);
    }, [bedid]);

    function generatePlants() {
        const plantArr = bedData?.seedbasket.map(plant => (
            <li key={plant.id}>
                <div style={{backgroundColor: plant.gridcolor}}></div>
                <p>{plant.name}</p>
            </li>
        ));
        return plantArr;
    };

    function generateMembers() {
        const membersList = bedData?.members.map(member => (
            <li key={member.id}>
                <p>{member.name}</p>
            </li>
        ));
        return membersList;
    };

    function generateEvents() {
        const sortedEvents = events?.slice();
        sortedEvents?.sort((a, b) => {
            return new Date(a.eventdate[0]) - new Date(b.eventdate[0]);
        });

        const eventsArr = sortedEvents?.map(event => <EventPreview key={event.id} event={event} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} />);
        return eventsArr;
    };

    useEffect(() => {
        if (eventOverviewVis) {
            const eventOverview: HTMLDialogElement | null = document.querySelector(".event-overview");
            eventOverview?.showModal();
        };
    }, [eventOverviewVis]);
    
    return (
        <>
            {bedDataErrMsg ? <p>{bedDataErrMsg}</p> : null}

            <Link to="/explore">Back to search results</Link>
            <h1>{bedData?.name}</h1>
            <p>{`Created by ${bedData?.username} on ${bedData?.created.slice(0, 10)}`}</p>
            <Grid bedData={bedData} interactive="inactive" />
            <section>
                <h2>Legend</h2>
                <section>
                    <h3>Seed Basket</h3>
                    <ul>
                        {generatePlants()}
                    </ul>
                </section>
            </section>
            <section>
                <h2>Specifications</h2>
                <p>{`Hardiness: ${bedData?.hardiness}`}</p>
                <p>{`Sunlight: ${bedData?.sunlight}`}</p>
                <p>{`Soil characteristics: ${bedData?.soil.join(", ")}`}</p>
            </section>
            <section>
                <h2>Members</h2>
                <ul>
                    {generateMembers()}
                </ul>
            </section>
            <section>
                <h2>Upcoming Events</h2>
                {eventsErrMsg ? 
                    <p>{eventsErrMsg}</p> :
                    generateEvents()
                }
            </section>
            {eventOverviewVis ? <ModifiedEventOverview currentEvent={currentEvent} setCurrentEvent={setCurrentEvent} setEventOverviewVis={setEventOverviewVis} fetchEvents={fetchEvents} /> : null}
            <RelatedBeds />
        </>
    );
};

export default BedResultPage;