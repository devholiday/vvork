import {doc, getDoc, getFirestore, updateDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const schema = yup.object({
    title: yup.string().max(255, 'Название должно быть не более 255 символов').required('Название обязательное поле'),
    salary: yup.number().typeError('Зарплата должна быть числом').max(99, 'Зарплата должна быть не более 2 символов').positive('Зарплата должна быть положительным числом').integer().required('Зарплата обязательное поле'),
    break: yup.number().typeError('Перерыв должен быть числом').max(99, 'Перерыв должен быть не более 3 символов').moreThan(-1, 'Перерыв должен быть положительным числом').integer(),
}).required();

export default function WorkWorkerEdit () {
    const {workId} = useParams();
    const navigate = useNavigate();

    const db = getFirestore();
    const auth = getAuth();

    const { register, handleSubmit, reset, getValues, formState:{ errors } } = useForm({
        resolver: yupResolver(schema)
    });

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

        navigate('/works/worker/'+workId);
    };

    return (
        <>
            <div className="container-header">
                <h2>{getValues('title')}</h2>
                <div className="form-buttons">
                    <button onClick={() => navigate('/works')}>Мои работы</button>
                    <button onClick={() => navigate('/works/worker/'+workId)}>Подробнее</button>
                </div>
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
                        <input type="checkbox" {...register("atNight")} />
                        Ночная смена
                    </label>
                </div>
                <div className="form-block">
                    <label>Начало</label>
                    <div className="timeControl">
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
