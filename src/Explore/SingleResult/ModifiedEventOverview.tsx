import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetUserQuery, useAddNotificationMutation } from "../../app/apiSlice";
import { useWrapRTKQuery, useWrapRTKMutation } from "../../app/customHooks";
import { eventInterface, userInterface } from "../../app/interfaces";
import { prepEventDateForDisplay, convert24to12, prepHyphenatedDateForDisplay} from "../../app/helpers";

interface eventOverviewInterface {
    setEventOverviewVis: React.Dispatch<React.SetStateAction<boolean>>,
    currentEvent?: eventInterface | null,
    setCurrentEvent: React.Dispatch<React.SetStateAction<eventInterface | null>>,
    fetchEvents: (bedid: string) => Promise<void>,
};

const ModifiedEventOverview: React.FC<eventOverviewInterface> = function({ currentEvent, setCurrentEvent, setEventOverviewVis, fetchEvents }) {
    const [ rsvpReceived, setRsvpReceived ] = useState(false);
    const { bedid } = useParams();

    const { data: userData } = useWrapRTKQuery(useGetUserQuery);
    const user = userData as userInterface;
    const { mutation: addNotification, isLoading: addNotificationIsLoading } = useWrapRTKMutation(useAddNotificationMutation);

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

    async function handleRSVP() {
        try {
            if (!addNotificationIsLoading) {
                // first send an rsvp'd notification to the event creator
                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: currentEvent?.creatorid,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "rsvpconfirmation",
                    bedid: bedid,
                    eventid: currentEvent?.id,
                    eventname: currentEvent?.eventname,
                }).unwrap();

                fetchEvents(bedid);

                // this is not derived from the state change, yet. above function call will fetch the updated rsvpsreceived to be correctly displayed when the dialog is NEXT opened, but not right now. so for now, as long as the added notification/event update and refetch were successful, user will see confirmation that their RSVP went through
                setRsvpReceived(true);
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
                    {currentEvent?.rsvpsreceived.includes(user?.id) || rsvpReceived ? 
                        <>
                            <p>You've RSVP'd.</p>
                            <button type="button" disabled>RSVP</button>
                        </> : 
                        <button type="button" onClick={handleRSVP}>RSVP</button>
                    }
                </>
                : null
            }
            <p>{currentEvent?.tags}</p>

            <div>
                <button type="button" onClick={() => {handleCloseEventOverview(); setCurrentEvent(null)}}>Close</button>
            </div>
        </dialog>
    )
};

export default ModifiedEventOverview;