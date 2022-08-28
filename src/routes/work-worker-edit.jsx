import {doc, getDoc, getFirestore, updateDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import Schedule from "../components/schedule/Schedule";
import {useNavigate, useParams} from "react-router-dom";
import style from "../components/event-new/EventNew.module.css";
import ShiftsWorkerAdd from "../components/shift-worker-add/ShiftsWorkerAdd";

export default function WorkWorkerEdit () {
    const [event, setEvent] = useState();
    const {workId} = useParams();
    const navigate = useNavigate();

    const db = getFirestore();
    const auth = getAuth();

    const { register, handleSubmit, reset, getValues } = useForm();

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, "worksWorker", workId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                if (docSnap.data().workerId !== auth.currentUser.uid) {
                    navigate('/works');
                    return;
                }

                reset(docSnap.data());
            } else {
                navigate('/works');
            }
        }

        fetchData();
    }, []);

    const onSubmit = async data => {
        const docRef = doc(db, "worksWorker", workId);
        await updateDoc(docRef, data);
    };

    const showDetailEvent = data => {
        setEvent(data)
    };

    return (
        <>
            <div className="container-header">
                <h2>{getValues('title')}</h2>
                <button onClick={() => navigate('/works')}>Вернуться</button>
            </div>

            <Schedule workId={workId} handleClickEnabledDay={showDetailEvent} config={{enabledAll: true}}/>
            {event && <ShiftsWorkerAdd workId={workId} atNight={getValues('atNight')} time={getValues('time')}
                                 event={event}/>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-block">
                    <input {...register("title")} placeholder="Название" />
                </div>
                <div className="form-block">
                    <label>Зарплата шек/час</label>
                    <input {...register("salary")} defaultValue="33" />
                </div>
                <div className="form-block">
                    <label>Перерыв на смене (в минутах)</label>
                    <input {...register("break")} placeholder="30" defaultValue="30"/>
                    <span>Это значение будет учитываться при расчете рабочих часов</span>
                </div>
                <div className="form-block">
                    <label>
                        <input type="checkbox" {...register("atNight")} />
                        Ночная смена
                    </label>
                </div>
                <div className="form-block">
                    <label>Начало</label>
                    <div className={style.timeControl}>
                        <input {...register("time.start.hours")} placeholder="18" />
                        <span> : </span>
                        <input {...register("time.start.minutes")} placeholder="00" />
                    </div>
                    <span>Это значение будет учитываться при расчете рабочих часов</span>
                </div>
                <div className="form-buttons">
                    <input className="btn-success" type="submit" value="Сохранить"/>
                </div>
            </form>
        </>
    );
};
