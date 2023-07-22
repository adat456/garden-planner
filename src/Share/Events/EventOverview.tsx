import { eventInterface, notificationInterface, userInterface } from "../../app/interfaces";
import { useGetUserQuery, useDeleteEventMutation, useGetNotificationsQuery, useAddNotificationMutation, useUpdateNotificationMutation } from "../../app/apiSlice";
import { prepEventDateForDisplay, convert24to12, prepHyphenatedDateForDisplay} from "../../app/helpers";

interface eventOverviewInterface {
    setEventFormVis: React.Dispatch<React.SetStateAction<boolean>>,
    setEventOverviewVis: React.Dispatch<React.SetStateAction<boolean>>,
    currentEvent?: eventInterface | null,
    setCurrentEvent: React.Dispatch<React.SetStateAction<eventInterface | null>>,
};

const EventOverview: React.FC<eventOverviewInterface> = function({ setEventFormVis, currentEvent, setCurrentEvent, setEventOverviewVis }) {
    const [ deleteEvent, { isLoading: deleteEventIsLoading } ] = useDeleteEventMutation();
    const { data: userData } = useGetUserQuery(undefined);
    const user = userData as userInterface;
    const { data: notificationsData } = useGetNotificationsQuery(undefined);
    const notifications = notificationsData as notificationInterface[];
    const [ addNotification,  { isLoading: addNotificationIsLoading } ] = useAddNotificationMutation();
    const [ updateNotification, { isLoading: updateNotificationIsLoading } ] = useUpdateNotificationMutation();


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

    async function handleDeleteEvent(repeatid: string | null = null) {
        if (currentEvent && !deleteEventIsLoading) {
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
                console.error("Unable to delete event(s): ", err.data);
            };
        };

        handleCloseEventOverview();
        setCurrentEvent(null);
    };

    async function handleRSVP() {
        if (currentEvent?.rsvpsreceived.includes(user?.id)) {
            console.log("You've already RSVP'd.");
            return;
        };
        try {
            if (!updateNotificationIsLoading && !addNotificationIsLoading) {
                // first send an rsvp'd notification to the event creator
                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: currentEvent?.creatorid,
                    message: `${user.firstname} ${user.lastname} has RSVP'd to ${currentEvent?.eventname}.`,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "rsvpconfirmation",
                    eventid: currentEvent?.id
                }).unwrap();
    
                // then, if the user did receive an rsvpinvite notification for this event, mark that as read and responded
                let matchingNotif: notificationInterface | null = null;
                notifications?.forEach(notif => {
                    if (notif.eventid === currentEvent?.id && notif.type === "rsvpinvite") matchingNotif = notif;
                });
                if (matchingNotif) {
                    await updateNotification({ 
                        notifid: matchingNotif?.id, 
                        read: true, 
                        responded: true 
                    }).unwrap();
                };
            };
        } catch(err) {
            console.error("Unable to RSVP to event: ", err.data);
        };
    };

    return (
        <dialog className="event-overview">
            <h3>{currentEvent?.eventname}</h3>
            <p>{`${prepEventDateForDisplay(currentEvent?.eventdate[0])} ${currentEvent?.eventdate[1] ? `- ${prepEventDateForDisplay(currentEvent?.eventdate[1])}` : ""}`}</p>
            <p>{`${currentEvent?.eventstarttime ? `${convert24to12(currentEvent?.eventstarttime)}` : ""} ${currentEvent?.eventendtime ? `- ${convert24to12(currentEvent?.eventendtime)}` : ""}`}</p>
            <p>{currentEvent?.eventdesc}</p>
            <p>{`Location: ${currentEvent?.eventlocation}`}</p>
            <p>{participantStatement}</p>
            {currentEvent?.eventpublic === "somemembers" ?
                <ul>
                    {generateParticipantList()}
                </ul>
                : null
            }
            {currentEvent?.rsvpneeded ?
                <>
                    <p>{`Please RSVP by ${prepHyphenatedDateForDisplay(currentEvent?.rsvpdate)}.`}</p>
                    <button type="button" onClick={handleRSVP}>RSVP</button>
                </>
                : null
            }
            <p>{currentEvent?.tags}</p>

            <div>
                <button type="button" onClick={() => {handleCloseEventOverview(); setCurrentEvent(null)}}>Close</button>
                <button type="button" onClick={handleOpenEventForm}>Edit</button>
                <button type="button" onClick={() => handleDeleteEvent(null)}>Delete</button>
                {currentEvent?.repeating ? <button type="button" onClick={() => handleDeleteEvent(currentEvent?.repeatid)}>Delete this event and all repeating events</button> : null}
            </div>
        </dialog>
    )
};

export default EventOverview;