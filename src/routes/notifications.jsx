import {useContext, useEffect, useState} from "react";
import {
    addDoc, collection, doc, getDoc, orderBy, getFirestore, onSnapshot, query, updateDoc, where, limit} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {WithRole} from "../hoc/WithRole";
import UserContext from "../context/UserContext";
import NotificationTypesWorker from "../components/notification-types-worker/NotificationTypesWorker";
import NotificationTypesAgent from "../components/notification-types-agent/NotificationTypesAgent";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [status, setStatus] = useState('unread');

    const db = getFirestore();
    const auth = getAuth();

    const user = useContext(UserContext);

    useEffect(() => {
        const user = auth.currentUser;

        const q = query(
            collection(db, "notifications"),
            orderBy("createdAt", "desc"),
            limit(25),
            where("recipientId", "==", user.uid),
            where("status", "==", status)
        );
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({id: doc.id, ...doc.data()});
            });

            const items2 = [];
            for (const item of items) {
                const docSnap = await getDoc(doc(db, "users", item.senderId));

                const senderPhone = docSnap.exists() ? docSnap.data().phoneNumber : null;

                items2.push({
                    id: item.id,
                    type: item.type,
                    createdAt: new Date(item.createdAt.seconds * 1000).toISOString().slice(0, 10),
                    senderPhone,
                    subjectId: item.subjectId,
                    senderId: item.senderId,
                    event: item.event,
                    status: item.status
                })
            }

            setNotifications(items2);
        });

        return () => {
            unsubscribe();
        }
    }, [status]);


    const updateNotification = async (notificationId, status) => {
        const notificationRef = doc(db, "notifications", notificationId);
        await updateDoc(notificationRef, {status});
    }
    const sendNotification = async (type, subjectId, recipientId, event=null) => {
        const docRef = await addDoc(collection(db, "notifications"), {
            type, subjectId, senderId: auth.currentUser.uid, recipientId,
            createdAt: new Date(), updatedAt: new Date(), status: 'unread',
            event
        });
        return docRef.id;
    }

    const NotificationTypesWithRole = WithRole(user.role, {
        ComponentForAgent: NotificationTypesAgent,
        ComponentForWorker: NotificationTypesWorker
    });

    return (
        <>
            <h2>Уведомления</h2>

            <div className="form-block">
                <select onChange={e => setStatus(e.target.value)}>
                    <option value="unread">Непрочитанные</option>
                    <option value="processed">Обработанные</option>
                </select>
            </div>

            <ul className="listItems">
                {notifications.map(notification => (
                    <li key={notification.id}>
                        <NotificationTypesWithRole notification={notification}
                                                   updateNotification={updateNotification}
                                                   sendNotification={sendNotification}/>
                    </li>
                ))}
            </ul>
        </>
    );
}