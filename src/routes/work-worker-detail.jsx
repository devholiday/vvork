import {doc, getDoc, getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {useEffect, useState} from "react";
import Schedule from "../components/schedule/Schedule";
import {useNavigate, useParams} from "react-router-dom";
import ShiftsWorkerAdd from "../components/shift-worker-add/ShiftsWorkerAdd";

export default function WorkWorkerDetail () {
    const [event, setEvent] = useState();
    const [work, setWork] = useState();
    const {workId} = useParams();
    const navigate = useNavigate();

    const db = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, "worksWorker", workId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setWork(docSnap.data());

                if (docSnap.data().workerId !== auth.currentUser.uid) {
                    navigate('/works');
                    return;
                }
            } else {
                navigate('/works');
            }
        }

        fetchData();
    }, []);

    const showDetailEvent = data => {
        setEvent(data)
    };

    return (
        <>
            <div className="container-header">
                <h2>{work?.title}</h2>
                <div className="form-buttons">
                    <button onClick={() => navigate('/works')}>Вернуться</button>
                    <button onClick={() => navigate('/works/worker/edit/'+workId)}>Редактировать</button>
                </div>
            </div>

            <Schedule workId={workId} handleClickEnabledDay={showDetailEvent} config={{enabledAll: true}}/>
            {event && <ShiftsWorkerAdd workId={workId} atNight={work.atNight} time={work.time}
                                       title={work.title} salary={work.salary} breakTime={work.break}
                                       event={event}/>}
        </>
    );
};
