import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {getAuth} from "firebase/auth";
import {addDoc, collection, getFirestore} from "firebase/firestore";
import {useContext, useEffect} from "react";
import UserContext from "../context/UserContext";
import style from "../components/event-new/EventNew.module.css";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const schema = yup.object({
    title: yup.string().max(255, 'Название должно быть не более 255 символов').required('Название обязательное поле'),
    salary: yup.number().typeError('Зарплата должна быть числом').max(99, 'Зарплата должна быть не более 2 символов').positive('Зарплата должна быть положительным числом').integer().required('Зарплата обязательное поле'),
    break: yup.number().typeError('Перерыв должен быть числом').max(99, 'Перерыв должен быть не более 3 символов').moreThan(-1, 'Перерыв должен быть положительным числом').integer(),
}).required();

export default function WorkWorkerNew() {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    const { register, handleSubmit, formState:{ errors } } = useForm({
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        if (user.role !== 'worker') {
            navigate('/works');
        }
    }, []);

    const onSubmit = async data => {
        const auth = getAuth();
        const db = getFirestore();

        const docRef = await addDoc(collection(db, "worksWorker"), {...data, workerId: auth.currentUser.uid});
        if (docRef.id) {
            navigate('/works/worker/edit/'+docRef.id);
        }
    };

    return (
        <>
            <div className="container-header">
                <h2>Новая работа</h2>
                <button onClick={() => navigate('/works')}>Вернуться</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-block">
                    <input {...register("title")} placeholder="Название" />
                    <p className="errorInput">{errors.title?.message}</p>
                </div>
                <div className="form-block">
                    <label>Зарплата шек/час</label>
                    <input type="number" {...register("salary")} defaultValue="33" />
                    <p className="errorInput">{errors.salary?.message}</p>
                    <span>Это значение будет учитываться при расчете рабочих часов</span>
                </div>
                <div className="form-block">
                    <label>Перерыв на смене (в минутах)</label>
                    <input type="number" {...register("break")} placeholder="30" defaultValue="30"/>
                    <p className="errorInput">{errors.break?.message}</p>
                    <span>Это значение будет учитываться при расчете рабочих часов</span>
                </div>
                <div className="form-block">
                    <label>
                        <input type="checkbox" {...register("atNight")} defaultChecked={true}/>
                        Ночная смена
                    </label>
                </div>
                <div className="form-block">
                    <label>Начало</label>
                    <div className={style.timeControl}>
                        <input {...register("time.start.hours")} defaultValue="18" />
                        <span> : </span>
                        <input {...register("time.start.minutes")} defaultValue="00" />
                    </div>
                    <span>Это значение будет учитываться при расчете рабочих часов</span>
                </div>
                <input className="btn-success" type="submit" value="Создать"/>
            </form>
        </>
    );
};