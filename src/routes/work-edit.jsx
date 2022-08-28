import {doc, getDoc, getFirestore, updateDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import AttachWorkersToWork from "../components/attach-workers-to-work/AttachWorkersToWork";
import Schedule from "../components/schedule/Schedule";
import EventNew from "../components/event-new/EventNew";
import {useNavigate, useParams} from "react-router-dom";
import EventEdit from "../components/event-edit/EventEdit";
import style from "../components/event-new/EventNew.module.css";

export default function WorkEdit () {
    const [event, setEvent] = useState(null);

    const {workId} = useParams();
    const navigate = useNavigate();

    const db = getFirestore();
    const auth = getAuth();

    const { register, handleSubmit, reset, getValues } = useForm();

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, "works", workId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                if (docSnap.data().agentId !== auth.currentUser.uid) {
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
        const docRef = doc(db, "works", workId);
        await updateDoc(docRef, data);
    };

    const updateStatus = async () => {
        const docRef = doc(db, "works", workId);
        await updateDoc(docRef, {status: 'archived'});
    };

    const handleClickEnabledDay = data => {
        setEvent(data);
    };

    return (
        <>
            <div className="container-header">
                <h2>{getValues('title')}</h2>
                <button onClick={() => navigate('/works')}>Вернуться</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-block">
                    <input {...register("title")} placeholder="Название" />
                </div>
                <div className="form-block">
                    <input {...register("shortTitle")} placeholder="Короткое название" />
                </div>
                <div className="form-block">
                    <textarea {...register("desc")} placeholder="Описание" />
                </div>
                <div className="form-block">
                    <textarea {...register("terms")} placeholder="Условия" />
                </div>
                <div className="form-block">
                    <textarea {...register("methodsGetSalary")} placeholder="Способы получения запрлаты" />
                </div>
                <div className="form-block">
                    <textarea {...register("desc2")} placeholder="Дополнительная информация" />
                </div>
                <div className="form-block">
                    <label>Зарплата шек/час</label>
                    <input {...register("salary")} placeholder="Зарплата" />
                </div>
                <div className="form-block">
                    <label>График работы</label>
                    <select {...register("schedule")}>
                        <option value="float">Плавающий</option>
                        <option value="regular">Обычный</option>
                    </select>
                </div>
                <div className="form-block">
                    <label>Перерыв на смене (в минутах)</label>
                    <input {...register("break")} placeholder="30" defaultValue="30"/>
                    <span>Это значение будет учитываться при расчете рабочих часов</span>
                </div>
                <div className="form-block">
                    <label>
                        <input type="checkbox" {...register("atNight")} />
                        Только ночная смена
                    </label>
                </div>
                <div className="form-block">
                    <label>Начало</label>
                    <div className={style.timeControl}>
                        <input {...register("time.start.hours")} placeholder="19" />
                        <span> : </span>
                        <input {...register("time.start.minutes")} placeholder="00" />
                    </div>
                    <span>Это значение будет учитываться при расчете рабочих часов</span>
                </div>
                <div className="form-buttons">
                    <input className="btn-success" type="submit" value="Сохранить"/>
                    {/*<button className="btn-danger" onClick={updateStatus}>В архив</button>*/}
                </div>
            </form>

            <AttachWorkersToWork workId={workId}/>

            {!event && <Schedule workId={workId} handleClickEnabledDay={handleClickEnabledDay}/>}
            {event && !event.eventId && <EventNew workId={workId} event={event} setEvent={setEvent} time={getValues('time')}/>}
            {event && event.eventId && <EventEdit workId={workId} eventId={event.eventId} time={event.time}
                                                  status={event.status} setEvent={setEvent}/>}
        </>
    );
};
