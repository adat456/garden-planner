import { useGetUserQuery, useGetNotificationsQuery, useAddNotificationMutation, useUpdateNotificationMutation, useDeleteNotificationMutation } from "../app/apiSlice";
import { notificationInterface, userInterface } from "../app/interfaces";

const Notifications: React.FC = function() {
    const { data: userResult, error: userQueryError } = useGetUserQuery(undefined);
    const user = userResult as userInterface;

    const { data, error: notificationsQueryError } = useGetNotificationsQuery(undefined);
    const notifications = data as notificationInterface[];

    const [ addNotification, { isLoading: addNotificationIsLoading } ]  = useAddNotificationMutation();
    const [ updateNotification, { isLoading: modifyNotificationIsLoading } ]  = useUpdateNotificationMutation();
    const [ deleteNotification, { isLoading: deleteNotificationIsLoading } ]  = useDeleteNotificationMutation();

    const unreadNotifications: number = notifications?.reduce((sum, notification) => {
        if (!notification.acknowledged) {
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
                    {notification.type === "invite" ? 
                        <button type="button" onClick={() => handleAcceptInvite(notification)}>Accept</button> : null
                    }
                    <button type="button" onClick={() => handleToggleAcknowledged(notification)}>{notification.acknowledged ? "Mark as unread" : "Mark as read"}</button>
                    <button type="button" onClick={() => handleDelete(notification.id)}>Delete</button>
                </li>
            ));
        };
        return notificationsArr;
    };

    async function handleAcceptInvite(notification: notificationInterface) {
        if (!addNotificationIsLoading && !modifyNotificationIsLoading) {
            try {
                if (!notification.acknowledged) {
                    await handleToggleAcknowledged(notification);
                };

                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: notification.senderid,
                    message: `${user.firstname} ${user.lastname} has accepted your invite.`,
                    dispatched: new Date().toISOString().slice(0, 10),
                    acknowledged: false,
                    type: "acceptance",
                    bedid: notification.bedid
                }).unwrap();
            } catch(err) {
                console.error("Unable to accept invite: ", err.message);
            };
        };
    };

    async function handleToggleAcknowledged(notification: notificationInterface) {
        if (!modifyNotificationIsLoading) {
            try {
                await updateNotification({
                    notifid: notification.id,
                    acknowledged: !notification.acknowledged
                }).unwrap();
            } catch(err) {
                console.error("Unable to update notification: ", err.message);
            };
        };
    };

    function handleAcknowledgeAll() {
        notifications.forEach(async (notification) => {
            try {
                await updateNotification({
                    notifid: notification.id,
                    acknowledged: true
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
            <button type="button" onClick={handleAcknowledgeAll}>Mark all as read</button>
            <button type="button" onClick={handleDeleteAll}>Delete all</button>
            <ul>
                {generateNotifications()}
            </ul>
        </div>
    );
};

export default Notifications;