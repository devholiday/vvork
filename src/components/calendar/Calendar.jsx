import style from "../calendar/Calendar.module.css";
import {useEffect, useState} from "react";
import {computeCalendar} from "../../utils/calendar";
import {collection, getDocs, getFirestore, query, where} from "firebase/firestore";

const Calendar = ({workId, handleClickEnabledDay}) => {
    const db = getFirestore();

    const [calendar, setCalendar] = useState();

    useEffect(() => {
        setCalendar(computeCalendar(null, null));

        getEvents();
    }, []);

    const getEvents = async (year=new Date().getFullYear(), month=new Date().getMonth()) => {
        const q = query(collection(db, "events"),
            where("workId", "==", workId),
            where("year", "==", year),
            where("month", "==", month),
        );
        const querySnapshot = await getDocs(q);
        let events = [];
        querySnapshot.forEach((doc) => {
            events.push({id: doc.id, ...doc.data()});
        });

        setCalendar(prevState => {
            events.forEach(e => {
                prevState['weeks'][e.numWeek][e.dayWeek]['status'] = e.status;
                prevState['weeks'][e.numWeek][e.dayWeek]['eventId'] = e.id;
                prevState['weeks'][e.numWeek][e.dayWeek]['time'] = e.time;
                prevState['weeks'][e.numWeek][e.dayWeek]['selected'] = true;
            });
            return {...prevState};
        });
    };

    const goToPrevMonth = async () => {
        setCalendar(computeCalendar(calendar?.prevYear, calendar?.prevMonth));
        await getEvents(calendar?.prevYear, calendar?.prevMonth);
    }
    const goToNextMonth = async () => {
        setCalendar(computeCalendar(calendar?.nextYear, calendar?.nextMonth))
        await getEvents(calendar?.nextYear, calendar?.nextMonth);
    }

    const handleClickDay = (year, month, day, numWeek, dayWeek, eventId, time, status) => {
        handleClickEnabledDay({year, month, day, numWeek, dayWeek, eventId, time, status});
    }

    return (
      <>
          <div className={style.calendar}>
              <div className={style.navs}>
                  <div className={style.navPrevMonth} onClick={goToPrevMonth}>Предыдущий</div>
                  <div className={style.navNextMonth} onClick={goToNextMonth}>Следущий</div>
              </div>
              <div className={style.monthName}>{calendar?.monthName} <span>{calendar?.year}</span></div>
              <div className={style.daysWeek}>
                  {calendar?.daysWeek.map((dw, i) => <div key={i}>{dw}</div>)}
              </div>
              <div>{calendar?.weeks.map((week, i) => (
                  <div key={i}>
                      {
                          week.map((day, j) => {
                              let classes = style.day;
                              if (day.inPastMonth) classes += ` ${style.dayPrevMonth}`;
                              if (day.inNextMonth) classes += ` ${style.dayNextMonth}`;
                              if (day.enabled) classes += ` ${style.on}`;
                              if (day.dayOff) classes += ` ${style.dayOff}`;
                              if (day.current) classes += ` ${style.current}`;
                              if (day.selected) classes += ` ${style.selected}`;
                              if (day.status==='completed') classes += ` ${style.selectedCompleted}`;
                              if (day.status==='cancelled') classes += ` ${style.selectedCancelled}`;
                              if (day.status==='pending') classes += ` ${style.selectedPending}`;

                              return (
                                  <div key={i+j} className={style.cell}
                                       onClick={day.enabled ? () =>
                                           handleClickDay(calendar?.year,calendar?.month, day.value, i, j,
                                               day.eventId, day.time, day.status) : null}>
                                      <span className={classes}>{day.value}</span>
                                  </div>
                              )
                          })
                      }
                  </div>
              ))}
              </div>
          </div>
      </>
    );
};

export default Calendar;