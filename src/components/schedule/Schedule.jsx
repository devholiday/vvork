import Calendar from "../calendar/Calendar";
import Events from "../events/Events";

import style from './Schedule.module.css';

const Schedule = ({workId, handleClickEnabledDay, config}) => {
    return (
        <div className={'block ' + style.schedule}>
            <h3>ГРАФИК РАБОТЫ</h3>
            <Calendar workId={workId} handleClickEnabledDay={handleClickEnabledDay} config={config}/>
            <Events />
        </div>
    );
};

export default Schedule;