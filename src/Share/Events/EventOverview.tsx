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

    let participants;
    if (currentEvent?.eventpublic) {
        participants = "This event is open to the public."
    } else {
        const participantsArr = currentEvent?.eventparticipants?.map(participant => participant.name);
        const participantsString = participantsArr?.join(", ");
        participants = `This event is only open to the following members: ${participantsString}.`
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
            <p>{participants}</p>

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