import { useState } from "react";
import {  useGetNotificationsQuery, useUpdateNotificationMutation, useDeleteNotificationMutation } from "../../app/apiSlice";
import { notificationInterface } from "../../app/interfaces";
import { useWrapRTKQuery, useWrapRTKMutation } from "../../app/customHooks";
import SingleNotification from "./SingleNotification";

const Notifications: React.FC = function() {
    const [ sort, setSort ] = useState("Most recent");

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

    function sortNotifications(sort: string) {
        if (sort === "Least recent") {
            const sortedNotifications = notifications?.slice();
            sortedNotifications?.sort((a, b) => {
                return new Date(a.dispatched) - new Date(b.dispatched);
            });
            return sortedNotifications;
        } else if (sort === "Most recent") {
            const sortedNotifications = notifications?.slice();
            sortedNotifications?.sort((a, b) => {
                return new Date(b.dispatched) - new Date(a.dispatched);
            });
            return sortedNotifications;
        };
    };

    function generateNotifications() {
        if (notifications) {
            const sortedNotifications = sortNotifications(sort);
            const notificationsArr = sortedNotifications?.map(notification => <SingleNotification key={notification.id} notification={notification} />);
            return notificationsArr;
        };
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
            <button type="button" onClick={() => {sort === "Most recent" ? setSort("Least recent") : setSort("Most recent");}}>{sort}</button>
            <button type="button" onClick={handleDeleteAll}>Delete all</button>
            <ul>
                {generateNotifications()}
            </ul>
        </div>
    );
};

export default Notifications;