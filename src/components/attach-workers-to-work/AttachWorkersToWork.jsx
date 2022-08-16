import {useForm} from "react-hook-form";
import {getFirestore, addDoc, collection, query, where, getDocs, doc, updateDoc} from "firebase/firestore";
import {useEffect, useState} from "react";
import {getAuth} from "firebase/auth";

import style from './AttachWorkersToWork.module.css';

const AttachWorkersToWork = ({workId}) => {
    const [jobInvitations, setJobInvitations] = useState([]);
    const db = getFirestore();
    const auth = getAuth();

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        const jobInvitationsRef = collection(db, "jobInvitations");
        const q = query(jobInvitationsRef,
            where("workId", "==", workId)
        );
        getDocs(q).then(querySnapshot => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({id: doc.id, ...doc.data()});
            });
            setJobInvitations(items);
        });
    }, []);

    const onSubmit = async data => {
        try {
            let {phone, salary, firstName} = data;

            if (!phone || !salary || !firstName) return;

            phone = phone.match(/\d/g).join('');
            if (phone.startsWith('0')) {
                phone = phone.slice(1);
            }
            phone = '+972' + phone;

            const userRecipient = await getUserByPhone(phone);
            if (userRecipient) {
                const job = await getJobInvitation(phone, workId, userRecipient.id);
                if (!job) {
                    const jobInvitationBody = {firstName, phone, salary, workerId: userRecipient.id, status: 'pending', workId,
                        agentId: auth.currentUser.uid, createdAt: new Date(), updatedAt: new Date()};
                    const docRef = await addDoc(collection(db, "jobInvitations"), jobInvitationBody);

                    await addDoc(collection(db, "notifications"), {
                        type: 'job_invitation', subjectId: workId, senderId: auth.currentUser.uid, recipientId: userRecipient.id,
                        createdAt: new Date(), updatedAt: new Date(), status: 'unread'
                    });

                    setJobInvitations(prevState => [...prevState, {id: docRef.id, ...jobInvitationBody}]);

                    reset();
                }
            }
        } catch (e) {
            console.log(e)
        }
    };

    const getUserByPhone = async phone => {
        try {
            const q = query(collection(db, "users"), where("phoneNumber", "==", phone));
            const querySnapshot = await getDocs(q);
            let user = null;
            querySnapshot.forEach((doc) => {
                user = doc.data();
            });
            return user;
        } catch (e) {
            return null;
        }
    };
    const getJobInvitation = async (phone, workId, workerId) => {
        try {
            const q = query(collection(db, "jobInvitations"),
                where("phone", "==", phone),
                where("workId", "==", workId),
                where("workerId", "==", workerId),
            );
            const querySnapshot = await getDocs(q);
            let job = null;
            querySnapshot.forEach((doc) => {
                job = doc.data();
            });
            return job;
        } catch (e) {
            return null;
        }
    };

    const archiveWorker = async (jobId, workerId) => {
        const status = 'archived';

        await updateDoc(doc(db, "jobInvitations", jobId), {status});

        await addDoc(collection(db, "notifications"), {
            type: 'job_archiving', subjectId: workId, senderId: auth.currentUser.uid, recipientId: workerId,
            createdAt: new Date(), updatedAt: new Date(), status: 'unread'
        });

        setJobInvitations(prevState => {
            return prevState.map(job => {
                if (job.id === jobId) {
                    job.status = status;
                }
                return job;
            })
        });
    };
    const inviteWorker = async (jobId, workerId) => {
        const status = 'pending';

        await updateDoc(doc(db, "jobInvitations", jobId), {status});

        await addDoc(collection(db, "notifications"), {
            type: 'job_invitation', subjectId: workId, senderId: auth.currentUser.uid, recipientId: workerId,
            createdAt: new Date(), updatedAt: new Date(), status: 'unread'
        });

        setJobInvitations(prevState => {
            return prevState.map(job => {
                if (job.id === jobId) {
                    job.status = status;
                }
                return job;
            })
        });
    };

    return (
        <div>
            <h3>ДОБАВИТЬ РАБОЧЕГО</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-block">
                    <input {...register("firstName")} placeholder="Имя" />
                </div>
                <div className="form-block">
                    <div className="input-box">
                        <span className="prefix">+972</span>
                        <input {...register("phone")} placeholder="Номер телефона" />
                    </div>
                </div>
                <div className="form-block">
                    <input {...register("salary")} placeholder="Зарплата в шек/час" />
                    <p>Это значение будет учитываться при расчете рабочих часов</p>
                </div>
                <input className="btn-success" type="submit" value="Добавить"/>
            </form>

            <div>
                <h3>РАБОЧИЕ</h3>
                <ul className={style.workersList}>
                    {jobInvitations.map(job => (
                        <li className={style.job} key={job.id}>
                            <div className={style.top}>
                                <div className={style.phoneName}>
                                    <span className={style.phone}>{job.phone}</span>
                                    <span className={style.firstName}>{job.firstName}</span>
                                </div>
                                <span className={job.status === 'confirmed' ? "label label-success" : "label label-danger"}>
                                    {job.status === 'confirmed' && 'Подтвержден '}
                                    {job.status === 'pending' && 'В ожидании '}
                                    {job.status === 'refused' && 'Отказано '}
                                    {job.status === 'archived' && 'В архиве '}

                                    {job.updatedAt.seconds && (
                                        <span> / {new Date(job.updatedAt.seconds * 1000).toISOString().slice(0, 10)}</span>
                                    )}
                                </span>
                            </div>
                            { job.status === 'confirmed' &&
                                <button className="btn-danger" onClick={() => archiveWorker(job.id, job.workerId)}>В архив</button>}
                            { (job.status === 'archived' || job.status === 'refused') &&
                                <button onClick={() => inviteWorker(job.id, job.workerId)}>Восстановить</button>}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AttachWorkersToWork;