import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { useGetBedsQuery, useGetUserQuery, useGetNotificationsQuery, useAddNotificationMutation, useUpdateNotificationMutation } from "../app/apiSlice";
import { bedDataInterface, notificationInterface, userInterface } from "../app/interfaces";

import Grid from "./Grid";
import EventsGroup from "./Events/EventsGroup";
import MemberGroup from "./Members/MemberGroup";
import BulletinLatest from "./Bulletin/BulletinLatest";

const BedSharingGroup: React.FC = function() {
    // "member", "pending", "nonmember" 
    // different from status in member interface, which is either "accepted" or "pending"
    const [ memberStatus, setMemberStatus ] = useState("");

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
    const { data: notificationsData } = useGetNotificationsQuery(undefined);
    const notifications = notificationsData as notificationInterface[];

    const [ addNotification,  { isLoading: addNotificationIsLoading } ] = useAddNotificationMutation();
    const [ updateNotification, { isLoading: updateNotificationIsLoading } ] = useUpdateNotificationMutation();

    useEffect(() => {
        if (bed && user) {
            if (bed?.username === user?.username) {
                setMemberStatus("member");
                return;
            };

            const memberEquivalent = bed?.members.find(member => member.id === user?.id);
            if (memberEquivalent) {
                if (memberEquivalent.status === "accepted") setMemberStatus("member");
                if (memberEquivalent.status === "pending") setMemberStatus("pending");
            } else {
                setMemberStatus("nonmember");
            };
        };
        if (!bed) setMemberStatus("nonmember");
    }, [bed, user]);

    async function handleAcceptInvite() {
        let matchingNotif: notificationInterface | null = null;
        notifications?.forEach(notif => {
            if (notif.bedid === bed?.id && notif.type === "memberinvite") matchingNotif = notif;
        });

        if (matchingNotif && !addNotificationIsLoading && !updateNotificationIsLoading) {
            try {
                // send notification back informing of accepted invite
                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: matchingNotif?.senderid,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "memberconfirmation",
                    bedid: bed.id,
                    bedname: bed.name
                }).unwrap();
                // update matching notification's read and responded statuses
                await updateNotification({
                    notifid: matchingNotif.id,
                    read: true,
                    responded: "confirmation",
                }).unwrap();
                // refetch to show all bed data now
                refetchBedData();
            } catch(err) {
                console.error("Unable to accept member invitation: ", err.message);
            };
        };
    };

    async function handleRejectInvite() {
        let matchingNotif: notificationInterface | null = null;
        notifications?.forEach(notif => {
            if (notif.bedid === bed?.id && notif.type === "memberinvite") matchingNotif = notif;
        });

        if (matchingNotif && !updateNotificationIsLoading && !addNotificationIsLoading) {
            try {
                // send notification back informing of declined invite
                await addNotification({
                    senderid: user.id,
                    sendername: `${user.firstname} ${user.lastname}`,
                    senderusername: user.username,
                    recipientid: matchingNotif?.senderid,
                    dispatched: new Date().toISOString().slice(0, 10),
                    type: "memberrejection",
                    bedid: bed.id,
                    bedname: bed.name
                }).unwrap();

                // update matching notification's read and responded statuses
                await updateNotification({
                    notifid: matchingNotif.id,
                    read: true,
                    responded: "rejection",
                }).unwrap();

                // refetch to display message that user does not have permission
                refetchBedData();
            } catch(err) {
                console.error("Unable to decline member invitation: ", err.message);
            }; 
        };     
    };

    return (
        <div>
            {memberStatus === "member" ?
                <>
                    <h1>{bed?.name}</h1>
                    <EventsGroup />
                    <Grid bedData={bed} />
                    <MemberGroup />
                    <BulletinLatest />
                </> : null
            }
            {memberStatus === "pending" ?
                <>
                    <div>
                        <p>You have received an invitation to become a member of this garden.</p>
                        <button type="button" onClick={handleAcceptInvite}>Become a member</button>
                        <button type="button" onClick={handleRejectInvite}>Dismiss invite</button>
                    </div>
                    <h1>{bed?.name}</h1>
                    <Grid bedData={bed} />
                </> : null
            }
            {memberStatus === "nonmember" ?
                <div>
                    <p>You do not have permission to view this garden.</p>
                </div> : null
            }
        </div>
    );
};

export default BedSharingGroup;