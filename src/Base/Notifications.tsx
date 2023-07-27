import { useEffect } from "react";
import {  useGetNotificationsQuery, useUpdateNotificationMutation, useDeleteNotificationMutation } from "../app/apiSlice";
import { notificationInterface } from "../app/interfaces";
import { useWrapRTKQuery, useWrapRTKMutation } from "../app/customHooks";
import SingleNotification from "./SingleNotification";

const Notifications: React.FC = function() {
    const { data } = useWrapRTKQuery(useGetNotificationsQuery);
    const notifications = data as notificationInterface[];

    const { mutation: updateNotification, isLoading: updateNotificationIsLoading }  = useWrapRTKMutation(useUpdateNotificationMutation);
    const { mutation: deleteNotification, isLoading: deleteNotificationIsLoading } = useWrapRTKMutation(useDeleteNotificationMutation);

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
            notificationsArr = notifications?.map(notification => <SingleNotification key={notification.id} notification={notification} />);
        };
        return notificationsArr;
    };

    function handleReadAll() {
        notifications.forEach(async (notification) => {
            if (!updateNotificationIsLoading) {
                try {
                    await updateNotification({
                        notifid: notification.id,
                        read: true,
                        responded: notification.responded,
                    }).unwrap();
                } catch(err) {
                    console.error("Unable to update notification: ", err.message);
                };
            };
        });
    };    
    function handleDeleteAll() {
        notifications.forEach(async (notification) => {
            if (!deleteNotificationIsLoading) {
                try {
                    await deleteNotification(notification.id)
                } catch(err) {
                    console.error(err.message);
                };
            };
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