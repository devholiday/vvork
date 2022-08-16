import Notification from "../notification/Notification";
import {Link} from "react-router-dom";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";

const NotificationTypesAgent = ({notification, updateNotification, sendNotification}) => {
    const {type, subjectId, id: notificationId, senderId, senderPhone, createdAt, event} = notification;

    const db = getFirestore();
    const auth = getAuth();

    return (
        <>
            {type === 'job_invitation_confirmation' && (
                <Notification
                    payload={{
                        createdAt,
                        title: 'Рабочий принял приглашение на работу',
                        text: 'Рабочий подтвердил ваш запрос.',
                        link: <Link to={'/works/edit/'+subjectId}>Подробнее</Link>,
                        senderPhone
                    }}
                />
            )}
            {type === 'job_invitation_refusal' && (
                <Notification
                    payload={{
                        createdAt,
                        title: 'Рабочий отказался от работы',
                        text: 'Рабочий отменил ваш запрос.',
                        link: <Link to={'/works/edit/'+subjectId}>Добавить нового рабочего</Link>,
                        senderPhone
                    }}
                />
            )}
            {type === 'shift_invitation_confirmation' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `Рабочий принял приглашение на смену - ${event.day}.${event.month}.${event.year}`,
                        text: 'Рабочий подтвердил ваш запрос.',
                        link: <Link to={'/works/edit/'+event.workId}>Подробнее</Link>,
                        senderPhone
                    }}
                />
            )}
            {type === 'shift_invitation_refusal' && (
                <Notification
                    payload={{
                        createdAt,
                        title: `Рабочий отказался от смены - ${event.day}.${event.month}.${event.year}`,
                        text: 'Рабочий отменил ваш запрос.',
                        link: <Link to={'/works/edit/'+event.workId}>Заменить другим рабочим</Link>,
                        senderPhone
                    }}
                />
            )}
        </>
    );
}

export default NotificationTypesAgent;