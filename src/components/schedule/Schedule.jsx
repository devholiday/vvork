import Calendar from "../calendar/Calendar";
import Events from "../events/Events";

import style from './Schedule.module.css';

const Schedule = ({workId, handleClickEnabledDay}) => {
    return (
        <div className={'block ' + style.schedule}>
            <h3>ГРАФИК РАБОТЫ</h3>
            <Calendar workId={workId} handleClickEnabledDay={handleClickEnabledDay}/>
            <Events />
        </div>
    );
};

export default Schedule;