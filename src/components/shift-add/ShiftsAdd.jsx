import style from './ShiftsAdd.module.css';
import {useForm} from "react-hook-form";
import {collection, getDocs, getFirestore, query, where, doc, getDoc, addDoc, updateDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const ShiftsAdd = ({workId, atNight, time:timeWork}) => {
    const [time, setTime] = useState(timeWork);

    const db = getFirestore();
    const auth = getAuth();

    const navigate = useNavigate();

    const { register, handleSubmit, setValue, reset } = useForm();

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    const yesterdayDate = new Date(year, month, day-1);

    useEffect(() => {
        if (time.start) {
            setValue('time.start.hours', time.start.hours ? time.start.hours : '19');
            setValue('time.start.minutes', time.start.minutes ? time.start.minutes : '00');
        }
    }, [time]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const event = await getEventByDate({
                    year: atNight ? yesterdayDate.getFullYear() : year,
                    month: atNight ? yesterdayDate.getMonth() : month,
                    day: atNight ? yesterdayDate.getDate() : day,
                    workId
                });
                if (!event) {
                    throw new Error('Error event');
                }

                if (event.time.start.hours && event.time.start.minutes) {
                    setTime(event.time);
                }
            } catch (e) {
                console.log(e);
            }
        };

        fetchData();
    }, []);

    const onSubmit = async data => {
        try {
            const eventData = {
                year: atNight ? yesterdayDate.getFullYear() : year,
                month: atNight ? yesterdayDate.getMonth() : month,
                day: atNight ? yesterdayDate.getDate() : day,
                workId
            };
            const event = await getEventByDate(eventData);
            if (!event) {
                throw new Error('Error event');
            }

            const jobInvitation = await getJobInvitation(workId, auth.currentUser.uid);
            if (!jobInvitation) {
                throw new Error('Error jobInvitation');
            }

            const shiftInvitation = await getShiftInvitation(event.id, auth.currentUser.uid);
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
                year: atNight ? yesterdayDate.getFullYear() : year,
                month: atNight ? yesterdayDate.getMonth() : month,
                day: atNight ? yesterdayDate.getDate() : day,
                workId,
                eventId: event.id,
                workerId: auth.currentUser.uid
            });
            if (shift) {
                throw new Error('Error shift exist');
            }

            await addDoc(collection(db, "shifts"), {
                workerId: auth.currentUser.uid,
                eventId: event.id,
                shiftInvitationId: shiftInvitation.id,
                workId,
                year: event.year,
                month: event.month,
                day: event.day,
                numWeek: event.numWeek,
                dayWeek: event.dayWeek,
                status: 'completed',
                time,
                atNight: atNight
            });

            const shiftInvitations = await getShiftInvitations(event.id);
            const shifts = await getShifts(event.id);
            if (shifts.length === shiftInvitations.length) {
                await updateDoc(doc(db, "events", event.id), {status: 'completed'});
            }

            navigate('/shifts');
        } catch (e) {
            reset();
        }
    };

    const getEventByDate = async eventData => {
        try {
            const q = query(collection(db, "events"),
                where("year", "==", eventData.year),
                where("month", "==", eventData.month),
                where("day", "==", eventData.day),
                where("workId", "==", eventData.workId),
                where("status", "==", 'pending'),
            );
            const querySnapshot = await getDocs(q);
            let event = null;
            querySnapshot.forEach((doc) => {
                event = doc.data();
                event.id = doc.id;
            });

            return event;
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
            let event = null;
            querySnapshot.forEach((doc) => {
                event = doc.data();
                event.id = doc.id;
            });

            return event;
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
            let event = null;
            querySnapshot.forEach((doc) => {
                event = doc.data();
                event.id = doc.id;
            });

            return event;
        } catch (e) {
            return null;
        }
    };
    const getShift = async shiftData => {
        try {
            const {eventId, workerId, workId, year, month, day} = shiftData;
            const q = query(collection(db, "shifts"),
                where("eventId", "==", eventId),
                where("workerId", "==", workerId),
                where("workId", "==", workId),
                where("year", "==", year),
                where("month", "==", month),
                where("day", "==", day)
            );
            const querySnapshot = await getDocs(q);
            let event = null;
            querySnapshot.forEach((doc) => {
                event = doc.data();
                event.id = doc.id;
            });

            return event;
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

    const updateStart = () => {
        if (time.start) {
            setValue('time.start.hours', time.start.hours ? time.start.hours : '19');
            setValue('time.start.minutes', time.start.minutes ? time.start.minutes : '00');
        }
    };
    const updateEnd = () => {
        const date = new Date();
        setValue('time.end.hours', date.getHours());
        setValue('time.end.minutes', date.getMinutes());
    };

    return (
      <div className={'block ' + style.shifts}>
          <h3>РАБОЧАЯ СМЕНА</h3>

          <div className={style.date}>
              {atNight && (
                  <>
                      <span>{`${yesterdayDate.getDate()}.${yesterdayDate.getMonth()+1}.${yesterdayDate.getFullYear()}`}</span>
                      <span> - </span>
                  </>
              )}
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