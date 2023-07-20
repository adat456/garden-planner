import { useGetUserQuery, useGetEventsQuery, useGetNotificationsQuery, useAddNotificationMutation, useUpdateNotificationMutation, useDeleteNotificationMutation } from "../app/apiSlice";
import { useNavigate } from "react-router-dom";
import { notificationInterface, userInterface } from "../app/interfaces";

const Notifications: React.FC = function() {
    const { data: userResult, error: userQueryError } = useGetUserQuery(undefined);
    const user = userResult as userInterface;
    const { data, error: notificationsQueryError } = useGetNotificationsQuery(undefined);
    const notifications = data as notificationInterface[];

    const [ addNotification, { isLoading: addNotificationIsLoading } ]  = useAddNotificationMutation();
    const [ updateNotification, { isLoading: updateNotificationIsLoading } ]  = useUpdateNotificationMutation();
    const [ deleteNotification, { isLoading: deleteNotificationIsLoading } ]  = useDeleteNotificationMutation();

    const navigate = useNavigate();

    const unreadNotifications: number = notifications?.reduce((sum, notification) => {
        if (!notification.read) {
            return (sum + 1);
        } else {
            return sum;
        };
    }, 0);
    function unreadNotificationsText() {
        let text;
        if (unreadNotifications === 0) {
            text = "No unread notifications.";
        } else {
            if (unreadNotifications === 1) {
                text = "1 unread notification.";
            } else {
                text = `${unreadNotifications} unread notifications.`;
            };
        };
        return text;
    };

    function generateNotifications() {
        let notificationsArr;
        if (notifications) {
            notificationsArr = notifications?.map(notification => (
                <li key={notification.id}>
                    <p>{notification.dispatched.slice(0, 10)}</p>
                    <p>{notification.message}</p>

                    {notification.type === "memberinvite" ? 
                        <>
                            {notification.responded ?
                                <p>Member confirmation sent.</p>:
                                <button type="button" onClick={() => handleConfirmInvite(notification)}>Become a member</button> 
                            }
                            <button type="button" onClick={() => navigate(`/share/${notification.bedid}`, {state: {senderid: notification.senderid}})}>See garden bed</button>
                        </>
                        : null
                    }

                    {notification.type === "rsvpinvite" ?
                        <>
                            {notification.responded ?
                                <p>RSVP sent.</p> :
                                <button type="button" onClick={() => handleConfirmInvite(notification)}>Send RSVP</button>
                            }
                            <button type="button" onClick={() => navigate(`/share/${notification.bedid}/events`, {state: {eventid: notification.eventid}})}>See event details</button>
                        </>
                        : null
                    }

                    <button type="button" onClick={() => handleReadnRespondStatus(notification.id, !notification.read)}>{notification.read ? "Mark as unread" : "Mark as read"}</button>
                    <button type="button" onClick={() => handleDelete(notification.id)}>Delete</button>
                </li>
            ));
        };
        return notificationsArr;
    };

    async function handleConfirmInvite(notification: notificationInterface) {
        if (!addNotificationIsLoading && !updateNotificationIsLoading) {
            try {
                if (notification.type === "memberinvite") {
                    const req = await fetch(`http://localhost:3000/get-bed-name-by-id/${notification.bedid}`, { credentials: "include" });
                    const res = await req.json();

                    await addNotification({
                        senderid: user.id,
                        sendername: `${user.firstname} ${user.lastname}`,
                        senderusername: user.username,
                        recipientid: notification.senderid,
                        message: `${user.firstname} ${user.lastname} is now a member of ${res}.`,
                        dispatched: new Date().toISOString().slice(0, 10),
                        type: "memberconfirmation",
                        bedid: notification.bedid
                    }).unwrap();

                    await handleReadnRespondStatus(notification.id, true, true);
                };

                if (notification.type === "rsvpinvite") {
                    const req = await fetch(`http://localhost:3000/get-event-name-by-id/${notification.eventid}`, { credentials: "include" });
                    const res = await req.json();

                    await addNotification({
                        senderid: user.id,
                        sendername: `${user.firstname} ${user.lastname}`,
                        senderusername: user.username,
                        recipientid: notification.senderid,
                        message: `${user.firstname} ${user.lastname} has RSVP'd to ${res}.`,
                        dispatched: new Date().toISOString().slice(0, 10),
                        type: "rsvpconfirmation",
                        eventid: notification.eventid
                    }).unwrap();

                    await handleReadnRespondStatus(notification.id, true, true);
                };
            } catch(err) {
                console.error("Unable to accept invite: ", err.message);
            };
        };
    };

    async function handleReadnRespondStatus(notifid: number, read: boolean, responded?: boolean) {
        if (!updateNotificationIsLoading) {
            try {
                if (responded) {
                    await updateNotification({ notifid, read, responded }).unwrap();
                } else {
                    await updateNotification({ notifid, read }).unwrap();
                };
            } catch(err) {
                console.error("Unable to update notification: ", err.message);
            };
        };
    };
    function handleReadAll() {
        notifications.forEach(async (notification) => {
            try {
                await updateNotification({
                    notifid: notification.id,
                    read: true
                }).unwrap();
            } catch(err) {
                console.error("Unable to update notification: ", err.message);
            };
        });
    };

    async function handleDelete(id: number) {
        if (!deleteNotificationIsLoading) {
            try {
                await deleteNotification(id).unwrap();
            } catch(err) {
                console.error("Unable to delete notification: ", err.message);
            };
        };
    };
    function handleDeleteAll() {
        notifications.forEach(async (notification) => {
            await handleDelete(notification.id);
        });
    };

    return (
        <div>
            <p>{unreadNotificationsText()}</p>
            <button type="button" onClick={handleReadAll}>Mark all as read</button>
            <button type="button" onClick={handleDeleteAll}>Delete all</button>
            <ul>
                {generateNotifications()}
            </ul>
        </div>
    );
};

export default Notifications;