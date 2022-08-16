import {useContext, useEffect} from "react";

import UserContext from '../context/UserContext';
import {doc, getDoc, getFirestore, updateDoc} from "firebase/firestore";
import {useForm} from "react-hook-form";
import Logout from "../components/logout/Logout";

export default function Account() {
    const db = getFirestore();

    const user = useContext(UserContext);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const docRef = doc(db, "users", user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                reset(docSnap.data());
            }
        }

        fetchData();
    }, [user]);

    const onSubmit = async data => {
        const docRef = doc(db, "users", user.id);
        await updateDoc(docRef, data);
    };

    return (
        <>
            <h2>Аккаунт</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-block">
                    <input {...register("firstName")} placeholder="Имя" />
                </div>
                <div className="form-block">
                    <label>Статус</label>
                    <select {...register("status")}>
                        {user?.role === 'worker' ? (
                            <>
                                <option value="looking_for_job">Ищу работу</option>
                                <option value="not_looking_for_job">Не ищу работу</option>
                            </>
                        ) : (
                            <>
                                <option value="looking_for_workers">Ищу рабочих</option>
                                <option value="not_looking_for_workers">Не ищу рабочих</option>
                            </>
                        )}
                    </select>
                </div>
                <div className="form-buttons">
                    <input className="btn-success" type="submit" value="Сохранить"/>
                </div>
            </form>

            <hr />

            <Logout />
        </>
    );
}