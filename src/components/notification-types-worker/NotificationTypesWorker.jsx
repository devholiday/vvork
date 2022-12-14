import Notification from "../notification/Notification";
import {collection, doc, getDocs, getFirestore, query, updateDoc, where, getDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {Link} from "react-router-dom";

const NotificationTypesWorker = ({notification, updateNotification, sendNotification}) => {
    const {type, subjectId, id: notificationId, senderId, senderPhone, createdAt, event, status} = notification;

    const db = getFirestore();
    const auth = getAuth();

    const confirmJob = (workId, notificationId, senderId) => {
        const jobInvitationsRef = collection(db, "jobInvitations");
        const q = query(jobInvitationsRef,
            where("workId", "==", workId),
            where("workerId", "==", auth.currentUser.uid)
        );
        getDocs(q).then(async querySnapshot => {
            let docId;
            querySnapshot.forEach((doc) => {
                docId = doc.id;
            });

            const jobInvitationRef = doc(db, "jobInvitations", docId);
            await updateDoc(jobInvitationRef, {status: 'confirmed', updateAt: new Date()});

            await updateNotification(notificationId, 'processed');
            await sendNotification('job_invitation_confirmation', workId, senderId);
        });
    };
    const refuseJob = (workId, notificationId, senderId) => {
        const jobInvitationsRef = collection(db, "jobInvitations");
        const q = query(jobInvitationsRef,
            where("workId", "==", workId),
            where("workerId", "==", auth.currentUser.uid)
        );
        getDocs(q).then(async querySnapshot => {
            let docId;
            querySnapshot.forEach((doc) => {
                docId = doc.id;
            });

            const jobInvitationRef = doc(db, "jobInvitations", docId);
            await updateDoc(jobInvitationRef, {status: 'refused', updateAt: new Date()});

            await updateNotification(notificationId, 'processed');
            await sendNotification('job_invitation_refusal', workId, senderId);
        });
    };

    const confirmShift = async (shiftInvitationId, notificationId, senderId) => {
        const shiftInvitationRef = doc(db, "shiftInvitations", shiftInvitationId);
        const shiftInvitation = await getDoc(shiftInvitationRef);
        if (shiftInvitation.data().status !== 'pending') {
            return;
        }

        await updateDoc(shiftInvitationRef, {status: 'confirmed', updateAt: new Date()});
        await updateNotification(notificationId, 'processed');
        await sendNotification('shift_invitation_confirmation', shiftInvitationId, senderId, event);
    };
    const refuseShift = async (shiftInvitationId, notificationId, senderId) => {
        const shiftInvitationRef = doc(db, "shiftInvitations", shiftInvitationId);
        await updateDoc(shiftInvitationRef, {status: 'refused', updateAt: new Date()});

        await updateNotification(notificationId, 'processed');
        await sendNotification('shift_invitation_refusal', shiftInvitationId, senderId, event);
    };

    return (
        <>
            {type === 'job_invitation' && (
                <Notification
                    payload={{
                        createdAt,
                        title: '?????????????????????? ???? ????????????',
                        text: '?????????? ???????????????????? ?????? ????????????.',
                        link: <Link to={'/works/'+subjectId}>?????????????????? ?? ????????????</Link>,
                        senderPhone
                    }}
                    buttons={status !== 'processed' ? [
                        {
                            style: 'btn-success',
                            name: '??????????????????????',
                            action: () => confirmJob(subjectId, notificationId, senderId)
                        },
                        {
                            style: 'btn-danger',
                            name: '????????????????????',
                            action: () => refuseJob(subjectId, notificationId, senderId)
                        },
                    ] : []}/>
            )}
            {type === 'shift_invitation' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `?????????????????????? ???? ?????????? - ${event.day}.${event.month+1}.${event.year}`,
                        text: '?????????? ???????????????????? ?????? ?????????? ???? ??????????.',
                        link: <Link to={'/works/'+event.workId}>???????????? ????????????</Link>,
                        senderPhone
                    }}
                    buttons={status !== 'processed' ? [
                        {
                            style: 'btn-success',
                            name: '??????????????????????',
                            action: () => confirmShift(subjectId, notificationId, senderId)
                        },
                        {
                            style: 'btn-danger',
                            name: '????????????????????',
                            action: () => refuseShift(subjectId, notificationId, senderId)
                        },
                    ] : []}/>
            )}
            {type === 'job_archiving' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `?????? ???????????????? ?? ??????????`,
                        text: '?????????? ?????????????? ?????? ?? ??????????.',
                        link: <Link to={'/works/'+subjectId}>?????????????????? ?? ????????????</Link>,
                        senderPhone
                    }}
                />
            )}
            {type === 'shift_cancelling' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `?????????? ???? ${event.day}.${event.month+1}.${event.year} ???????????????? ??????????????`,
                        text: '?????????? ?????????????? ??????????.',
                        link: '',
                        senderPhone
                    }}
                />
            )}
            {type === 'shift_updated_time' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `?????????????????? ?????????????? ???????????? ?????????? ${event.day}.${event.month+1}.${event.year} ???? 
                        ${event.time.start.hours}:${event.time.start.minutes}`,
                        text: '?????????? ?????????????? ?????????? ???????????? ??????????.',
                        link: <Link to={'/works/'+event.workId}>???????????? ????????????</Link>,
                        senderPhone
                    }}
                />
            )}
        </>
    );
}

export default NotificationTypesWorker;