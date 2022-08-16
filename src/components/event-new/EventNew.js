import { useForm } from "react-hook-form";
import {addDoc, collection, doc, getDocs, getFirestore, query, updateDoc, where} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useEffect, useState} from "react";

import style from "./EventNew.module.css";

const EventNew = ({workId, event, setEvent, time}) => {
    const [jobInvitations, setJobInvitations] = useState([]);

    const db = getFirestore();
    const auth = getAuth();

    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        if (time.start) {
            setValue('time.start.hours', time.start.hours ? time.start.hours : '');
            setValue('time.start.minutes', time.start.minutes ? time.start.minutes : '');
        }
    }, [time]);
    useEffect(() => {
        const fetchData = async () => {
            const jobInvitations = await getJobInvitations(workId);
            setJobInvitations(jobInvitations);
        };

        fetchData();
    }, []);

    const onSubmit = async data => {
        try {
            let {time, workerIds=[]} = data;

            if (!workerIds || workerIds.length === 0) {
                return;
            }
            if (!Array.isArray(workerIds)) {
                workerIds = [workerIds];
            }

            if (time.start.hours === '' || time.start.minutes === '') {
                throw new Error('Error time start');
            }

            const {year,month,day,numWeek,dayWeek} = event;
            const eventObj = {
                status: "pending", time,
                year, month, day, numWeek, dayWeek,
                workId, agentId: auth.currentUser.uid
            };
            const newEvent = await addDoc(collection(db, "events"), eventObj);
            await addShiftsAndNotificationsToWorkers(workerIds, workId, {...eventObj, id: newEvent.id});

            setEvent(null);
        } catch (e) {
            console.log(e);
        }
    };

    const addShiftsAndNotificationsToWorkers = async (workerIds, workId, event) => {
        for (const workerId of workerIds) {
            const shiftInvitation = await addDoc(collection(db, "shiftInvitations"), {
                eventId: event.id, workerId, workId,
                createdAt: new Date(), updatedAt: new Date(),
                status: "pending"
            });
            await sendNotificationByRecipientId('shift_invitation',
                {subjectId: shiftInvitation.id, recipientId: workerId, event});
        }
    }
    const sendNotificationByRecipientId = async (type, payload) => {
        const {subjectId, recipientId, event} = payload;
        await addDoc(collection(db, "notifications"), {
            type, subjectId, senderId: auth.currentUser.uid, recipientId,
            createdAt: new Date(), updatedAt: new Date(), status: 'unread',
            event
        });
    }
    const getJobInvitations = async workId => {
        const q = query(collection(db, "jobInvitations"),
            where("workId", "==", workId),
            where("status", "==", "confirmed"),
        );
        const querySnapshot = await getDocs(q);
        let workers = [];
        querySnapshot.forEach((doc) => {
            workers.push(doc.data());
        });

        return workers;
    }

    return (
        <div className="alert-block">
            <span className="title">Создать смену на {`${event.day}.${event.month+1}.${event.year}`}</span>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-block">
                    <label>Начало</label>
                    <div className={style.timeControl}>
                        <input {...register("time.start.hours")} placeholder="19" />
                        <span> : </span>
                        <input {...register("time.start.minutes")} placeholder="00" />
                    </div>
                    <span>Это значение будет учитываться при расчете рабочих часов</span>
                </div>

                {jobInvitations.length > 0 && (
                    <div>
                        <span className={style.workersListTitle}>Список рабочих:</span>

                        {jobInvitations.map((jobInvitation, i) => (
                            <div key={i} className="form-block">
                                <label>
                                    <input type="checkbox" {...register("workerIds")} defaultChecked={true}
                                           defaultValue={jobInvitation.workerId}/>
                                    {jobInvitation.phone} / {jobInvitation.firstName}</label>
                            </div>
                        ))}
                    </div>
                )}

                <div className="form-buttons">
                    <input className="btn-success" type="submit" value="Сохранить" />
                    <button className="btn-secondary" type="button" onClick={() => setEvent(null)}>Вернуться</button>
                </div>
            </form>
        </div>
    );
};

export default EventNew;