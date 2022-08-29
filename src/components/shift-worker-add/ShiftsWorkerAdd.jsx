import style from './ShiftsWorkerAdd.module.css';
import {useForm} from "react-hook-form";
import {collection, getDocs, getFirestore, query, where, doc, getDoc, addDoc, updateDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const ShiftsWorkerAdd = ({workId, atNight, time: timeWork, title, salary, breakTime, event}) => {
    const [time, setTime] = useState(timeWork);

    const db = getFirestore();
    const auth = getAuth();

    const navigate = useNavigate();

    const { register, handleSubmit, setValue, reset } = useForm();

    const {year, month, day, numWeek, dayWeek} = event;

    useEffect(() => {
        if (time.start) {
            setValue('time.start.hours', time.start.hours ? time.start.hours : '19');
            setValue('time.start.minutes', time.start.minutes ? time.start.minutes : '00');
        }
    }, [time]);

    const onSubmit = async data => {
        try {
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
                workerId: auth.currentUser.uid,
                day, month, year
            });
            if (shift) {
                throw new Error('Error shift exist');
            }

            await addDoc(collection(db, "shiftsWorker"), {
                workerId: auth.currentUser.uid,
                workId,
                year,
                month,
                day,
                numWeek,
                dayWeek,
                status: 'completed',
                time, atNight,
                salary: +salary,
                break: +breakTime,
                title
            });

            navigate('/shifts/worker');
        } catch (e) {
            setValue('time.end.hours', '');
            setValue('time.end.minutes', '');
        }
    };

    const getShift = async shiftData => {
        try {
            const {workId, workerId, day, month, year} = shiftData;
            const q = query(collection(db, "shiftsWorker"),
                where("workId", "==", workId),
                where("workerId", "==", workerId),
                where("day", "==", day),
                where("month", "==", month),
                where("year", "==", year),
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

export default ShiftsWorkerAdd;