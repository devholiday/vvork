import { useForm } from "react-hook-form";
import {addDoc, collection, doc, getDocs, getFirestore, query, updateDoc, where, getDoc, deleteDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useEffect, useState} from "react";
import style from "./EventEdit.module.css";
import EventWorkers from "../event-workers/EventWorkers";

const EventEdit = ({workId, eventId, time:timeSrc, status, setEvent}) => {
    const [jobInvitations, setJobInvitations] = useState([]);
    const [jobInvitationsWithShiftCompleted, setJobInvitationsWithShiftConfirmed] = useState([]);
    const [jobInvitationsWithShiftRefused, setJobInvitationsWithShiftRefused] = useState([]);
    const [jobInvitationsWithShiftPending, setJobInvitationsWithShiftPending] = useState([]);

    const db = getFirestore();
    const auth = getAuth();

    const { register, handleSubmit, reset, getValues } = useForm();

    useEffect(() => {
        const fetchData = async () => {
            const event = await getEventById(eventId);
            reset(event);

            const workerIdsWithShift = {
                confirmed: [],
                refused: [],
                cancelled: [],
                pending: [],
            };
            const workerIds = [];

            const shifts = await getShiftInvitations(eventId);
            for (const shift of shifts) {
                workerIds.push(shift.workerId);

                if (shift.status === 'confirmed') {
                    workerIdsWithShift.confirmed.push(shift.workerId);
                }
                if (shift.status === 'refused') {
                    workerIdsWithShift.refused.push(shift.workerId);
                }
                if (shift.status === 'cancelled') {
                    workerIdsWithShift.cancelled.push(shift.workerId);
                }
                if (shift.status === 'pending') {
                    workerIdsWithShift.pending.push(shift.workerId);
                }
            }

            const conditions = [where("workId", "==", workId)];
            if (workerIds.length > 0) {
                conditions.push(where("workerId", "not-in", workerIds))
            }
            const jobInvitations = await getJobInvitations(workId, conditions);
            setJobInvitations(jobInvitations);

            if (workerIdsWithShift.confirmed.length > 0) {
                const jobInvitations = await getJobInvitations(workId, [
                    where("workId", "==", workId),
                    where("workerId", "in", workerIdsWithShift.confirmed)
                ]);
                setJobInvitationsWithShiftConfirmed(jobInvitations);
            }
            if (workerIdsWithShift.refused.length > 0) {
                const jobInvitations = await getJobInvitations(workId, [
                    where("workId", "==", workId),
                    where("workerId", "in", workerIdsWithShift.refused)
                ]);
                setJobInvitationsWithShiftRefused(jobInvitations);
            }
            if (workerIdsWithShift.pending.length > 0) {
                const jobInvitations = await getJobInvitations(workId, [
                    where("workId", "==", workId),
                    where("workerId", "in", workerIdsWithShift.pending)
                ]);
                setJobInvitationsWithShiftPending(jobInvitations);
            }
        };

        fetchData();
    }, []);

    const onSubmit = async data => {
        try {
            let {time, workerIds=[]} = data;

            if (!workerIds) {
                workerIds = [];
            }
            if (!Array.isArray(workerIds)) {
                workerIds = [workerIds];
            }

            if (time.start.hours === '' || time.start.minutes === '') {
                throw new Error('Error time start');
            }

            if (timeSrc.start.hours !== time.start.hours || timeSrc.start.minutes !== time.start.minutes) {
                await updateDoc(doc(db, "events", eventId), {time});

                const shifts = await getShiftInvitations(eventId);
                for (const shift of shifts) {
                    await sendNotificationByRecipientId('shift_updated_time',
                        {subjectId: shift.id, recipientId: shift.workerId});
                }
            }

            await addShifts(workerIds, eventId, workId);

            setEvent(null);
        } catch (e) {
            console.log(e);
        }
    };

    const cancelEvent = async eventId => {
        await updateDoc(doc(db, "events", eventId), {status: 'cancelled'});

        const shifts = await getShiftInvitations(eventId);
        for (const shift of shifts) {
            await updateDoc(doc(db, "shiftInvitations", shift.id), {status: 'cancelled'});
            await sendNotificationByRecipientId('shift_cancelling',
                {subjectId: shift.id, recipientId: shift.workerId});
        }

        setEvent(null);
    };
    const addShifts = async (workerIds, eventId, workId) => {
        for (const workerId of workerIds) {
            const shiftInvitation = await addDoc(collection(db, "shiftInvitations"), {
                eventId, workerId, workId,
                createdAt: new Date(), updatedAt: new Date(),
                status: "pending"
            });
            await sendNotificationByRecipientId('shift_invitation',
                {subjectId: shiftInvitation.id, recipientId: workerId});
        }
    }
    const sendNotificationByRecipientId = async (type, payload) => {
        const {subjectId, recipientId} = payload;
        await addDoc(collection(db, "notifications"), {
            type, subjectId, senderId: auth.currentUser.uid, recipientId,
            createdAt: new Date(), updatedAt: new Date(), status: 'unread',
            event: getValues()
        });
    }
    const getEventById = async eventId => {
        try {
            const docRef = doc(db, "events", eventId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    };
    const getJobInvitations = async (workId, conditions=[]) => {
        const q = query(collection(db, "jobInvitations"), ...conditions);
        const querySnapshot = await getDocs(q);
        let workers = [];
        querySnapshot.forEach((doc) => {
            workers.push({id:doc.id, ...doc.data()});
        });

        return workers;
    }
    const getShiftInvitations = async eventId => {
        const q = query(collection(db, "shiftInvitations"),
            where("eventId", "==", eventId)
        );
        const querySnapshot = await getDocs(q);
        let shifts = [];
        querySnapshot.forEach((doc) => {
            shifts.push({...doc.data(), id: doc.id});
        });

        return shifts;
    }
    const getShiftInvitation = async (workId, workerId, eventId) => {
        try {
            const q = query(collection(db, "shiftInvitations"),
                where("eventId", "==", eventId),
                where("workId", "==", workId),
                where("workerId", "==", workerId),
            );
            const querySnapshot = await getDocs(q);
            let shift = null;
            querySnapshot.forEach((doc) => {
                shift = {id: doc.id, ...doc.data()};
            });
            return shift;
        } catch (e) {
            return null;
        }
    };

    const revokeShiftInvitation = async (phone, firstName, workId, workerId) => {
        const shift = await getShiftInvitation(workId, workerId, eventId);

        await deleteDoc(doc(db, "shiftInvitations", shift.id));
        await sendNotificationByRecipientId('shift_cancelling',
            {subjectId: null, recipientId: workerId});

        setJobInvitations(prevState => [...prevState, {workerId, phone, firstName}]);
        setJobInvitationsWithShiftConfirmed(prevState => prevState.filter(j => j.workerId !== workerId));
        setJobInvitationsWithShiftPending(prevState => prevState.filter(j => j.workerId !== workerId));
    }
    const resendShiftInvitation = async (phone, firstName, workId, workerId) => {
        const shift = await getShiftInvitation(workId, workerId, eventId);

        await updateDoc(doc(db, "shiftInvitations", shift.id), {status: "pending"});
        await sendNotificationByRecipientId('shift_invitation',
            {subjectId: shift.id, recipientId: workerId});

        setJobInvitationsWithShiftRefused(prevState => prevState.filter(j => j.workerId !== workerId));
        setJobInvitationsWithShiftPending(prevState => [...prevState, {
            phone, firstName, workId, workerId
        }]);
    }

    return (
        <div className="alert-block">
            <div className={style.top}>
                <span className="title">Смена на {`${getValues('day')}.${getValues('month')+1}.${getValues('year')}`}</span>
                <span className={style.status}>
                    {status === 'completed' && 'Завершена'}
                    {status === 'cancelled' && 'Отменена'}
                    {status === 'pending' && 'Ожидание'}
                </span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                {status !== 'cancelled' && (
                    <div className="form-block">
                        <label>Начало</label>
                        <div className={style.timeControl}>
                            <input {...register("time.start.hours")} placeholder="19" />
                            <span> : </span>
                            <input {...register("time.start.minutes")} placeholder="00" />
                        </div>
                        <span>Это значение будет учитываться при расчете рабочих часов.{' '}
                            <u>При изменении времени приглашенным рабочим придет уведомление.</u>
                    </span>
                    </div>
                    )}

                {jobInvitations.length > 0 && (
                    <div>
                        <span className={style.workersListTitle}>Список рабочих:</span>

                        {jobInvitations.map((jobInvitation, i) => (
                            <div key={i} className="form-block">
                                <label>
                                    <input type="checkbox" {...register("workerIds")} defaultChecked={false}
                                           defaultValue={jobInvitation.workerId}/>
                                    {jobInvitation.phone} / {jobInvitation.firstName}</label>
                            </div>
                        ))}
                    </div>
                )}

                <div className="form-buttons">
                    {status !== 'cancelled' && (
                        <>
                            <input className="btn-success" type="submit" value="Сохранить" />
                            <button className="btn-danger" type="button" onClick={() => cancelEvent(eventId)}>Отменить</button>
                        </>
                    )}
                    <button className="btn-secondary" type="button" onClick={() => setEvent(null)}>Вернуться</button>
                </div>
            </form>

            <EventWorkers payload={{jobInvitationsWithShiftCompleted, jobInvitationsWithShiftRefused,
                jobInvitationsWithShiftPending}} revokeShiftInvitation={revokeShiftInvitation}
                          resendShiftInvitation={resendShiftInvitation}/>
        </div>
    );
};

export default EventEdit;