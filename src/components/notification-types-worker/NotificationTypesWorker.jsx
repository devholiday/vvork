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
                        title: 'Приглашение на работу',
                        text: 'Агент предлагает вам работу.',
                        link: <Link to={'/works/'+subjectId}>Подробнее о работе</Link>,
                        senderPhone
                    }}
                    buttons={status !== 'processed' ? [
                        {
                            style: 'btn-success',
                            name: 'Подтвердить',
                            action: () => confirmJob(subjectId, notificationId, senderId)
                        },
                        {
                            style: 'btn-danger',
                            name: 'Отказаться',
                            action: () => refuseJob(subjectId, notificationId, senderId)
                        },
                    ] : []}/>
            )}
            {type === 'shift_invitation' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `Приглашение на смену - ${event.day}.${event.month+1}.${event.year}`,
                        text: 'Агент предлагает вам выйти на смену.',
                        link: <Link to={'/works/'+event.workId}>График работы</Link>,
                        senderPhone
                    }}
                    buttons={status !== 'processed' ? [
                        {
                            style: 'btn-success',
                            name: 'Подтвердить',
                            action: () => confirmShift(subjectId, notificationId, senderId)
                        },
                        {
                            style: 'btn-danger',
                            name: 'Отказаться',
                            action: () => refuseShift(subjectId, notificationId, senderId)
                        },
                    ] : []}/>
            )}
            {type === 'job_archiving' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `Вас поместил в архив`,
                        text: 'Агент добавил вас в архив.',
                        link: <Link to={'/works/'+subjectId}>Подробнее о работе</Link>,
                        senderPhone
                    }}
                />
            )}
            {type === 'shift_cancelling' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `Смена на ${event.day}.${event.month+1}.${event.year} отменена агентом`,
                        text: 'Агент отменил смену.',
                        link: '',
                        senderPhone
                    }}
                />
            )}
            {type === 'shift_updated_time' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `Изменение времени начала смены ${event.day}.${event.month+1}.${event.year} на 
                        ${event.time.start.hours}:${event.time.start.minutes}`,
                        text: 'Агент изменил время начала смены.',
                        link: <Link to={'/works/'+event.workId}>График работы</Link>,
                        senderPhone
                    }}
                />
            )}
        </>
    );
}

export default NotificationTypesWorker;