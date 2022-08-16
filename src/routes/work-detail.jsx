import {useContext, useEffect, useState} from "react";
import UserContext from "../context/UserContext";
import {doc, getDoc, getFirestore} from "firebase/firestore";
import Schedule from "../components/schedule/Schedule";
import ShiftsAdd from "../components/shift-add/ShiftsAdd";
import {useNavigate, useParams} from "react-router-dom";

export default function WorkDetail() {
    const [job, setJob] = useState();

    const {workId} = useParams();
    const user = useContext(UserContext);
    const navigate = useNavigate();

    const db = getFirestore();

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, "works", workId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setJob(docSnap.data());
            } else {
                navigate('/works');
            }
        }

        fetchData();
    }, []);

    const showDetailEvent = (year, month, day) => {
        // console.log(year, month, day)
    };

    return (
        <>
            <button onClick={() => navigate('/works')}>Вернуться</button>

            <h2>{job?.title}</h2>

            {job?.desc && (
                <div className="block">
                    <h3>ОПИСАНИЕ</h3>
                    <p>{job?.desc}</p>
                </div>
            )}

            {job?.desc2 && (
                <div className="block">
                    <h3>ДОПОЛНИТЕЛЬНОЕ ОПИСАНИЕ</h3>
                    <p>{job?.desc2}</p>
                </div>
            )}
            {job?.terms && (
                <div className="block">
                    <h3>УСЛОВИЯ</h3>
                    <p>{job?.terms}</p>
                </div>
            )}
            {job?.methodsGetSalary && (
                <div className="block">
                    <h3>СПОСОБЫ ПОЛУЧЕНИЯ ЗАРПЛАТЫ</h3>
                    <p>{job?.methodsGetSalary}</p>
                </div>
            )}
            {job?.salary && (
                <div className="block">
                    <h3>ЗАРПЛАТА</h3>
                    <p>{job?.salary}</p>
                </div>
            )}
            {job?.schedule && (
                <div className="block">
                    <h3>РАСПИСАНИЕ</h3>
                    <p>{job?.schedule === 'float' && 'Плавающий'}</p>
                    <p>{job?.schedule === 'regular' && 'обычный'}</p>
                </div>
            )}

            <Schedule workId={workId} handleClickEnabledDay={showDetailEvent}/>

            {user.role === 'worker' && job && <ShiftsAdd workId={workId} atNight={job.atNight} time={job.time} />}
        </>
    );
}