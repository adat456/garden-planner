import { useState, useEffect } from "react";
import { useGetUserQuery, useGetBedsQuery, useGetEventsQuery, useUpdateNotificationMutation, useDeleteNotificationMutation, useAddNotificationMutation } from "../app/apiSlice";
import { notificationInterface, userInterface } from "../app/interfaces";
import { Link } from "react-router-dom";
import { useWrapRTKMutation, useWrapRTKQuery } from "../app/customHooks";

const SingleNotification: React.FC<{notification: notificationInterface}> = function({ notification }) {
    // const [ currentBedIdForEvents, setCurrentBedIdForEvents ] = useState<number | string | undefined>(undefined);

    const { data: userResult } = useWrapRTKQuery(useGetUserQuery);
    const user = userResult as userInterface;
    const { refetch: refetchBedsData } = useWrapRTKQuery(useGetBedsQuery);
    // const { refetch: refetchEvents } = useGetEventsQuery(currentBedIdForEvents);

    const { mutation: addNotification, isLoading: addNotificationIsLoading } = useWrapRTKMutation(useAddNotificationMutation);
    const { mutation: updateNotification, isLoading: updateNotificationIsLoading } = useWrapRTKMutation(useUpdateNotificationMutation);
    const { mutation: deleteNotification, isLoading: deleteNotificationIsLoading } = useWrapRTKMutation(useDeleteNotificationMutation);

    function generateNotificationMessage() {
        // messages containing links to either the garden bed or the event (event link contains state so that event dialog can be opened up upon navigation)... clicking on this link will mark the notification as read (responded stays the same)
        switch (notification.type) {
            case "memberinvite":  
                return <p>{notification.sendername} invites you to join <Link to={`/share/${notification.bedid}`} onClick={() => handleReadnRespondStatus(notification.id, true, notification.responded)}>{notification.bedname}</Link>.</p>;
            case "memberconfirmation": 
                return <p>{notification.sendername} has accepted your invitation to join <Link to={`/share/${notification.bedid}`} onClick={() => handleReadnRespondStatus(notification.id, true, notification.responded)}>{notification.bedname}</Link>.</p>;
            case "memberrejection":
                return <p>{notification.sendername} has declined your invitation to join <Link to={`/share/${notification.bedid}`} onClick={() => handleReadnRespondStatus(notification.id, true, notification.responded)}>{notification.bedname}</Link>.</p>;
            case "rsvpinvite":
                return <p>{notification.sendername} has invited you to attend <Link to={`/share/${notification.bedid}/events`} state={{eventid: notification.eventid}} onClick={() => handleReadnRespondStatus(notification.id, true, notification.responded)}>{notification.eventname}</Link> on {notification.eventdate}. Please RSVP by {notification.rsvpdate}.</p>;
            case "rsvpconfirmation":
                return <p>{notification.sendername} has RSVP'd to your event, <Link to={`/share/${notification.bedid}/events`} state={{eventid: notification.eventid}} onClick={() => handleReadnRespondStatus(notification.id, true, notification.responded)}>{notification.eventname}</Link>.</p>; 
        };
    };

    async function handleReadnRespondStatus(notifid: number, read: boolean, responded: string) {
        if (!updateNotificationIsLoading) {
            try {
                await updateNotification({ notifid, read, responded }).unwrap();
            } catch(err) {
                console.error("Unable to toggle read/respond status: ", err.message);
            };
        };
    };
    async function handleDelete() {
        if (!deleteNotificationIsLoading) {
            try {
                await deleteNotification(notification.id).unwrap();
            } catch(err) {
                console.error("Unable to delete notification: ", err.message);
            };
        };
    };

    async function handleAcceptMembershipInvite() {
        if (!addNotificationIsLoading && !updateNotificationIsLoading) {
            try {
                // send notification back informing of confirmation
                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: notification.senderid,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "memberconfirmation",
                    bedid: notification.bedid,
                    bedname: notification.bedname
                }).unwrap();
                // update current notification
                await handleReadnRespondStatus(notification.id, true, "confirmation");
                // refetch beds data
                refetchBedsData();
            } catch(err) {
                if (err.message) console.error(err.message);
            };
        };
    };
    async function handleDeclineMembershipInvite() {
        if (!addNotificationIsLoading && !updateNotificationIsLoading) {
            try {
                // send notification back informing of rejection
                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: notification.senderid,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "memberrejection",
                    bedid: notification.bedid,
                    bedname: notification.bedname
                }).unwrap();
                // update current notification
                await handleReadnRespondStatus(notification.id, true, "rejection");
                // refetch beds data
                refetchBedsData();
            } catch(err) {
                if (err.message) console.error(err.message);
            };
        };
    };
    async function handleSendRSVP() {
        if (!addNotificationIsLoading && !updateNotificationIsLoading) {
            try {
                setCurrentBedIdForEvents(notification.bedid);

                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: notification.senderid,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "rsvpconfirmation",
                    bedid: notification.bedid,
                    eventid: notification.eventid,
                    eventname: notification.eventname,
                }).unwrap();
                await handleReadnRespondStatus(notification.id, true, "confirmation");

                refetchEvents();
            } catch(err) {
                if (err.message) console.error(err.message);
            };
        };
    };

    // useEffect(() => {
    //     if (currentBedIdForEvents) refetchEvents();
    // }, [currentBedIdForEvents]);

    return (
        <li key={notification.id}>
            <p>{notification.dispatched.slice(0, 10)}</p>
            {generateNotificationMessage()}

            {notification.type === "memberinvite" ? 
                notification.responded ?
                    <p>{`Membership ${notification.responded} sent.`}</p>:
                    <>
                        <button type="button" onClick={handleAcceptMembershipInvite}>Accept invite</button>
                        <button type="button" onClick={handleDeclineMembershipInvite}>Decline invite</button>
                    </>
                : null
            }
            {notification.type === "rsvpinvite" ?
                notification.responded ?
                    <p>{`RSVP ${notification.responded} sent.`}</p> :
                    <button type="button" onClick={handleSendRSVP}>Send RSVP</button>
                : null
            }

            <button type="button" onClick={() => handleReadnRespondStatus(notification.id, !notification.read, notification.responded)}>{notification.read ? "Mark as unread" : "Mark as read"}</button>
            <button type="button" onClick={handleDelete}>Delete</button>
        </li>
    );
};

export default SingleNotification;