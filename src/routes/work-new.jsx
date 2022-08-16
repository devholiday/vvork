import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {getAuth} from "firebase/auth";
import {addDoc, collection, getFirestore} from "firebase/firestore";
import {useContext, useEffect} from "react";
import UserContext from "../context/UserContext";
import style from "../components/event-new/EventNew.module.css";

export default function WorkNew() {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    const { register, handleSubmit } = useForm();

    useEffect(() => {
        if (user.role !== 'agent') {
            navigate('/works');
        }
    }, []);

    const onSubmit = async data => {
        const auth = getAuth();
        const db = getFirestore();

        const docRef = await addDoc(collection(db, "works"), {...data, agentId: auth.currentUser.uid});
        if (docRef.id) {
            navigate('/works/edit/'+docRef.id);
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
                    <input {...register("salary")} placeholder="34-36" />
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
                <div className="form-block">
                    <label>Статус</label>
                    <select {...register("status")}>
                        <option value="active">Активный</option>
                        <option value="draft">Черновик</option>
                    </select>
                </div>
                <input className="btn-success" type="submit" value="Создать"/>
            </form>
        </>
    );
};