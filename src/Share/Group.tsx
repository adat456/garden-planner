import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetBedsQuery, useGetUserQuery, useGetNotificationsQuery, useAddNotificationMutation, useUpdateNotificationMutation } from "../app/apiSlice";
import { bedDataInterface, notificationInterface, userInterface } from "../app/interfaces";

import Grid from "./Grid";
import EventsGroup from "./Events/EventsGroup";
import MemberGroup from "./Members/MemberGroup";
import BulletinLatest from "./Bulletin/BulletinLatest";

const BedSharingGroup: React.FC = function() {
    const [ isMember, setIsMember ] = useState(false);

    const { bedid } = useParams();
    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed as bedDataInterface;
    const refetchBedData = bedObject.refetch;
    const { data: userData } = useGetUserQuery(undefined);
    const user = userData as userInterface;
    const { data: notificationsData, refetch: refetchNotificationsData } = useGetNotificationsQuery(undefined);
    const notifications = notificationsData as notificationInterface[];

    const [ addNotification,  { isLoading: addNotificationIsLoading } ] = useAddNotificationMutation();
    const [ updateNotification, { isLoading: updateNotificationIsLoading } ] = useUpdateNotificationMutation();

    useEffect(() => {
        if (bed && user) {
            if (bed?.username === user?.username) setIsMember(true);
            bed?.members.forEach(member => {
                if (member.id === user?.id && member.status === "accepted") setIsMember(true);
            });
        };
    }, [bed, user]);

    async function handleAcceptInvite() {
        let matchingNotif;
        notifications?.forEach(notif => {
            if (notif.bedid === bed?.id && notif.type === "memberinvite") matchingNotif = notif;
        });

        if (!addNotificationIsLoading && matchingNotif &&!updateNotificationIsLoading) {
            try {
                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: matchingNotif?.senderid,
                    message: `${user.firstname} ${user.lastname} is now a member of ${bed.name}.`,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "memberconfirmation",
                    bedid: bed.id
                }).unwrap();

                await updateNotification({
                    notifid: matchingNotif.id,
                    read: true,
                    responded: true,
                }).unwrap();

                await refetchNotificationsData;
                await refetchBedData;
            } catch(err) {
                console.error("Unable to accept member invitation: ", err.message);
            };
        };
    };

    async function handleRejectInvite() {
        let matchingNotif;
        notifications?.forEach(notif => {
            if (notif.bedid === bed?.id && notif.type === "memberinvite") matchingNotif = notif;
        });

        if (!updateNotificationIsLoading && matchingNotif) {
            try {
                await updateNotification({
                    notifid: matchingNotif.id,
                    read: true,
                    responded: true,
                }).unwrap();
            } catch(err) {

            }; 
        };     
    };

    return (
        <div>
            {isMember ?
                <>
                    <h1>{bed?.name}</h1>
                    <EventsGroup />
                    <Grid bedData={bed} />
                    <MemberGroup />
                    <BulletinLatest />
                </> :
                <>
                    <div>
                        <p>You have received an invitation to become a member of this garden.</p>
                        <button type="button" onClick={handleAcceptInvite}>Become a member</button>
                        <button type="button" onClick={handleRejectInvite}>Dismiss invite</button>
                    </div>
                    <h1>{bed?.name}</h1>
                    <Grid bedData={bed} />
                    <MemberGroup />
                </>
            }
            
        </div>
    );
};

export default BedSharingGroup;