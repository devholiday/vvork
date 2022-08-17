import style from './ShiftsAdd.module.css';
import {useForm} from "react-hook-form";
import {collection, getDocs, getFirestore, query, where, doc, getDoc, addDoc, updateDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const ShiftsAdd = ({workId, atNight, time:timeWork, eventId, year, month, day}) => {
    const [time, setTime] = useState(timeWork);

    const db = getFirestore();
    const auth = getAuth();

    const navigate = useNavigate();

    const { register, handleSubmit, setValue, reset } = useForm();

    useEffect(() => {
        if (time.start) {
            setValue('time.start.hours', time.start.hours ? time.start.hours : '19');
            setValue('time.start.minutes', time.start.minutes ? time.start.minutes : '00');
        }
    }, [time]);

    const onSubmit = async data => {
        try {
            const event = await getEventById(eventId);
            if (!event) {
                throw new Error('Error event');
            }

            const jobInvitation = await getJobInvitation(workId, auth.currentUser.uid);
            if (!jobInvitation) {
                throw new Error('Error jobInvitation');
            }

            const shiftInvitation = await getShiftInvitation(eventId, auth.currentUser.uid);
            if (!shiftInvitation) {
                throw new Error('Error shiftInvitation');
            }

            const {time} = data;
            const {start, end} = time;
            if (start.hours === '' || start.minutes === '') {
                throw new Error('Error time start');
            }
            if (end.hours === '' || end.minutes === '') {
                throw new Error('Error time end');
            }

            const shift = await getShift({
                workId,
                eventId,
                workerId: auth.currentUser.uid,
                shiftInvitationId: shiftInvitation.id
            });
            if (shift) {
                throw new Error('Error shift exist');
            }

            await addDoc(collection(db, "shifts"), {
                workerId: auth.currentUser.uid,
                eventId,
                shiftInvitationId: shiftInvitation.id,
                workId,
                year: event.year,
                month: event.month,
                day: event.day,
                numWeek: event.numWeek,
                dayWeek: event.dayWeek,
                status: 'completed',
                time, atNight
            });

            const shiftInvitations = await getShiftInvitations(eventId);
            const shifts = await getShifts(eventId);
            if (shifts.length === shiftInvitations.length) {
                await updateDoc(doc(db, "events", eventId), {status: 'completed'});
            }

            navigate('/shifts');
        } catch (e) {
            console.log(e)
            reset();
        }
    };

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
    const getJobInvitation = async (workId, workerId) => {
        try {
            const q = query(collection(db, "jobInvitations"),
                where("workId", "==", workId),
                where("workerId", "==", workerId),
                where("status", "==", 'confirmed'),
            );
            const querySnapshot = await getDocs(q);
            let jobInvitation = null;
            querySnapshot.forEach((doc) => {
                jobInvitation = doc.data();
                jobInvitation.id = doc.id;
            });

            return jobInvitation;
        } catch (e) {
            return null;
        }
    };
    const getShiftInvitation = async (eventId, workerId) => {
        try {
            const q = query(collection(db, "shiftInvitations"),
                where("eventId", "==", eventId),
                where("workerId", "==", workerId),
                where("status", "==", 'confirmed'),
            );
            const querySnapshot = await getDocs(q);
            let shiftInvitation = null;
            querySnapshot.forEach((doc) => {
                shiftInvitation = doc.data();
                shiftInvitation.id = doc.id;
            });

            return shiftInvitation;
        } catch (e) {
            return null;
        }
    };
    const getShift = async shiftData => {
        try {
            const {workId, eventId, workerId, shiftInvitationId} = shiftData;
            const q = query(collection(db, "shifts"),
                where("workId", "==", workId),
                where("eventId", "==", eventId),
                where("workerId", "==", workerId),
                where("shiftInvitationId", "==", shiftInvitationId),
            );
            const querySnapshot = await getDocs(q);
            let shift = null;
            querySnapshot.forEach((doc) => {
                shift = doc.data();
                shift.id = doc.id;
            });

            return shift;
        } catch (e) {
            return null;
        }
    };
    const getShifts = async eventId => {
        try {
            const q = query(collection(db, "shifts"),
                where("eventId", "==", eventId)
            );
            const querySnapshot = await getDocs(q);
            const shifts = [];
            querySnapshot.forEach((doc) => {
                shifts.push({id:doc.id, ...doc.data()});
            });

            return shifts;
        } catch (e) {
            return null;
        }
    };
    const getShiftInvitations = async eventId => {
        try {
            const q = query(collection(db, "shiftInvitations"),
                where("eventId", "==", eventId),
                where("status", "==", 'confirmed'),
            );
            const querySnapshot = await getDocs(q);
            const shiftInvitations = [];
            querySnapshot.forEach((doc) => {
                shiftInvitations.push({id: doc.id, ...doc.data()})
            });

            return shiftInvitations;
        } catch (e) {
            return null;
        }
    };

    const updateEnd = () => {
        const date = new Date();
        setValue('time.end.hours', date.getHours());
        setValue('time.end.minutes', date.getMinutes());
    };

    if (new Date().getTime() < new Date(`${year}-${month+1}-${day}`).getTime()) {
        return (
            <div className={'block ' + style.shifts}>
                <h3>РАБОЧАЯ СМЕНА</h3>
                <div className={style.date}>
                    <span>{`${day}.${month+1}.${year}`}</span>
                </div>
                <div>
                    <span>Для того чтобы внести показания времени выберите актуальную дату</span>
                </div>
            </div>
        )
    }

    return (
        <div className={'block ' + style.shifts}>
            <h3>РАБОЧАЯ СМЕНА</h3>

            <div className={style.date}>
                <span>{`${day}.${month+1}.${year}`}</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={style.time}>
                    <div className={style.timeStart}>
                        <span>Начало</span>
                        <div className={style.timeControl}>
                            <input {...register("time.start.hours")} placeholder="19" />
                            <span> : </span>
                            <input {...register("time.start.minutes")} placeholder="00" />
                        </div>
                        {/*<button type="button" onClick={updateStart}>Шаблон</button>*/}
                    </div>
                    <div className={style.timeEnd}>
                        <span>Конец</span>
                        <div className={style.timeControl}>
                            <input {...register("time.end.hours")} placeholder="3" />
                            <span> : </span>
                            <input {...register("time.end.minutes")} placeholder="00" />
                        </div>
                        <button type="button" onClick={updateEnd}>Сейчас</button>
                    </div>
                </div>

                <div className={style.btnSubmit}>
                    <input className="btn-success" type="submit" value="Добавить"/>
                </div>
            </form>
        </div>
    );
};

export default ShiftsAdd;