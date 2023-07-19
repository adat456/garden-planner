import { eventInterface } from "../../app/interfaces";
import { useDeleteEventMutation } from "../../app/apiSlice";

interface eventOverviewInterface {
    setEventFormVis: React.Dispatch<React.SetStateAction<boolean>>,
    setEventOverviewVis: React.Dispatch<React.SetStateAction<boolean>>,
    currentEvent?: eventInterface | null,
    setCurrentEvent: React.Dispatch<React.SetStateAction<eventInterface | null>>,
};

const EventOverview: React.FC<eventOverviewInterface> = function({ setEventFormVis, currentEvent, setCurrentEvent, setEventOverviewVis }) {
    const [ deleteEvent, { isLoading } ] = useDeleteEventMutation();

    let participantStatement;
    if (currentEvent?.eventpublic === "public") {
        participantStatement = "This event is open to the public.";
    } else if (currentEvent?.eventpublic === "allmembers") {
        participantStatement = "This event is open to all members.";
    } else if (currentEvent?.eventpublic === "somemembers") {
        participantStatement = "This event is only open to the following members:"
    };

    function generateParticipantList() {
        const participantList = currentEvent?.eventparticipants?.map(participant => {
            console.log(currentEvent);
            console.log(participant.id);
            console.log(currentEvent?.rsvpsreceived.includes(participant.id));
            return (<li>{`${participant.name} ${currentEvent?.rsvpsreceived.includes(participant.id) ? "[RSVP'd]" : ""}`}</li>);
        });
        return participantList;
    };

    function handleCloseEventOverview() {
        const eventOverview: HTMLDialogElement | null = document.querySelector(".event-overview");
        eventOverview?.close();
        setEventOverviewVis(false);
    };
    function handleOpenEventForm() {
        handleCloseEventOverview();
        setEventFormVis(true);
    };

    async function handleDeleteEvent(repeatid: string | undefined = undefined) {
        if (currentEvent && !isLoading) {
            try {
                if (repeatid) {
                    await deleteEvent({
                        eventid: currentEvent.id,
                        repeatid: currentEvent.repeatid
                    }).unwrap();
                };

                if (!repeatid) {
                    await deleteEvent({
                        eventid: currentEvent.id,
                    }).unwrap();
                };
            } catch(err) {
                console.error("Unable to delete event(s): ", err.message);
            };
        };

        handleCloseEventOverview();
        setCurrentEvent(null);
    };

    return (
        <dialog className="event-overview">
            <h3>{currentEvent?.eventname}</h3>
            <p>{`${currentEvent?.eventdate[0]} ${currentEvent?.eventdate[1] ? `- ${currentEvent?.eventdate[1]}` : ""}`}</p>
            <p>{`${currentEvent?.eventstarttime} ${currentEvent?.eventendtime ? `- ${currentEvent?.eventendtime}` : ""}`}</p>
            <p>{currentEvent?.eventdesc}</p>
            <p>{`Location: ${currentEvent?.eventlocation}`}</p>
            <p>{participantStatement}</p>
            {currentEvent?.eventpublic === "somemembers" ?
                <ul>
                    {generateParticipantList()}
                </ul>
                : null
            }
            <p>{currentEvent?.tags}</p>

            <div>
                <button type="button" onClick={() => {handleCloseEventOverview(); setCurrentEvent(null)}}>Close</button>
                <button type="button" onClick={handleOpenEventForm}>Edit</button>
                <button type="button" onClick={() => handleDeleteEvent(undefined)}>Delete</button>
                {currentEvent?.repeating ? <button type="button" onClick={() => handleDeleteEvent(currentEvent?.repeatid)}>Delete this event and all repeating events</button> : null}
            </div>
        </dialog>
    )
};

export default EventOverview;