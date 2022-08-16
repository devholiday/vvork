import style from './EventWorkers.module.css';

const EventWorkers = ({payload, revokeShiftInvitation, resendShiftInvitation}) => {
    const {jobInvitationsWithShiftCompleted, jobInvitationsWithShiftRefused, jobInvitationsWithShiftPending} = payload;

    return (
        <div className={style.workers}>
            {jobInvitationsWithShiftCompleted.length > 0 && (
                <div className={style.workersContainer}>
                    <span className={style.heading}>Подтвердили</span>
                    <ul>
                        {jobInvitationsWithShiftCompleted.map((jobInvitation, i) => (
                            <li key={i} className={"form-block " + style.liWorker}>
                                <span className={style.workerPhone}>{jobInvitation.phone} / {jobInvitation.firstName}</span>
                                <button type="button" onClick={() => revokeShiftInvitation(
                                    jobInvitation.phone, jobInvitation.firstName,
                                    jobInvitation.workId, jobInvitation.workerId)}>Отозвать</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {jobInvitationsWithShiftRefused.length > 0 && (
                <div className={style.workersContainer}>
                    <span className={style.heading}>Отказались</span>
                    <ul>
                        {jobInvitationsWithShiftRefused.map((jobInvitation, i) => (
                            <li key={i} className={"form-block " + style.liWorker}>
                                <span className={style.workerPhone}>{jobInvitation.phone} / {jobInvitation.firstName}</span>
                                <button type="button" onClick={() => resendShiftInvitation(
                                    jobInvitation.phone, jobInvitation.firstName,
                                    jobInvitation.workId, jobInvitation.workerId)}>Повторить</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {jobInvitationsWithShiftPending.length > 0 && (
                <div className={style.workersContainer}>
                    <span className={style.heading}>В ожидании</span>
                    <ul>
                        <ul>
                            {jobInvitationsWithShiftPending.map((jobInvitation, i) => (
                                <li key={i} className={"form-block " + style.liWorker}>
                                    <span className={style.workerPhone}>{jobInvitation.phone} / {jobInvitation.firstName}</span>
                                    <button type="button" onClick={() => revokeShiftInvitation(
                                        jobInvitation.phone, jobInvitation.firstName,
                                        jobInvitation.workId, jobInvitation.workerId)}>Отозвать</button>
                                </li>
                            ))}
                        </ul>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EventWorkers;