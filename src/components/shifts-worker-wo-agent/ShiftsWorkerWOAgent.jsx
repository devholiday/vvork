import {useEffect, useState} from "react";
import {collection, getDocs, getFirestore, query, where, doc, getDoc, orderBy, limit} from "firebase/firestore";
import {getAuth} from "firebase/auth";

import style from './ShiftsWorkerWOAgent.module.css';

const ShiftsWorkerWOAgent = () => {
    const db = getFirestore();
    const auth = getAuth();

    const [calendar, setCalendar] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [analytics, setAnalytics] = useState({time: {hours:0, minutes:0}, ttlMoney: 0});

    const computeCalendar = (year=null, month=null) => {
        const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

        const date = new Date();
        year = year ?? date.getFullYear();
        month = month ?? date.getMonth();

        const dateByLastDayPrevMonth = new Date(year, month, 0);
        const dateByLastDayNextMonth = new Date(year, month+2, 0);

        return {
            prevMonth: dateByLastDayPrevMonth.getMonth(),
            prevYear: dateByLastDayPrevMonth.getFullYear(),
            nextMonth: dateByLastDayNextMonth.getMonth(),
            nextYear: dateByLastDayNextMonth.getFullYear(),
            monthName: months[month],
            year,
            month,
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setCalendar(computeCalendar(null, null));
            setAnalytics({time: {hours:0, minutes:0}, ttlMoney: 0});

            const shifts = await getComplexShifts();
            setShifts(shifts);
        }

        fetchData();
    }, []);

    const getShifts = async (year, month) => {
        try {
            const q = query(
                collection(db, "shiftsWorker"),
                orderBy("day", "desc"),
                limit(31),
                where("workerId", "==", auth.currentUser.uid),
                where("year", "==", year),
                where("month", "==", month),
            );
            const querySnapshot = await getDocs(q);
            const shifts = [];
            querySnapshot.forEach((doc) => {
                shifts.push({...doc.data(), id: doc.id});
            });

            return shifts;
        } catch (e) {
            return null;
        }
    };
    const getWorkById = async workId => {
        const docRef = doc(db, "worksWorker", workId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    };

    const getComplexShifts = async (year=new Date().getFullYear(), month=new Date().getMonth()) => {
        const shiftsData = await getShifts(year, month);
        const shifts = [];

        for (const shift of shiftsData) {
            const work = await getWorkById(shift.workId);

            const {start, end} = shift.time;

            let hours = +(24-start.hours) + +end.hours;
            let minutes = +start.minutes + +end.minutes;
            if (minutes > 60) {
                hours += 1;
                minutes -= 60;
            }

            if (minutes - +work.break < 0) {
                hours -= 1;
                minutes += +work.break;
            } else {
                minutes -= +work.break;
            }

            const m = hours*60 + minutes;
            let money = +(+work.salary/60).toFixed(5) * m;
            money = +money.toFixed(2);

            setAnalytics(prevState => {
                prevState.time.hours += hours;
                prevState.time.minutes += minutes;

                if (prevState.time.minutes > 60) {
                    prevState.time.hours += 1;
                    prevState.time.minutes -= 60;
                }

                prevState.ttlMoney += money;

                return prevState;
            });

            shifts.push({
                id: shift.id,
                day: shift.day,
                place: work.title,
                interval: `${start.hours}:${start.minutes} - ${end.hours}:${end.minutes}`,
                time: {hours, minutes},
                salary: +work.salary,
                money,
                break: +work.break
            });
        }

        return shifts;
    }

    const goToPrevMonth = async () => {
        setCalendar(computeCalendar(calendar?.prevYear, calendar?.prevMonth));

        setAnalytics({time: {hours:0, minutes:0}, ttlMoney: 0});

        const shifts = await getComplexShifts(calendar?.prevYear, calendar?.prevMonth);
        setShifts(shifts);
    }
    const goToNextMonth = async () => {
        setCalendar(computeCalendar(calendar?.nextYear, calendar?.nextMonth))

        setAnalytics({time: {hours:0, minutes:0}, ttlMoney: 0});

        const shifts = await getComplexShifts(calendar?.nextYear, calendar?.nextMonth);
        setShifts(shifts);
    }

    return (
      <>
          <h2>Мои смены</h2>

          <div className={style.shifts}>
              <div>
                  <div className={style.navs}>
                      <div className={style.navPrevMonth} onClick={goToPrevMonth}>Предыдущий</div>
                      <div className={style.navNextMonth} onClick={goToNextMonth}>Следущий</div>
                  </div>
                  <div className={style.monthName}>{calendar?.monthName} <span>{calendar?.year}</span></div>
              </div>
              <div className={style.analytics}>
                  <div className={style.circle}>
                      <span className={style.valueInCircle}>{analytics.time.hours}:{analytics.time.minutes < 10 ? '0'+analytics.time.minutes: analytics.time.minutes}</span>
                      <span className={style.keyInCircle}>ЧАСОВ</span>
                  </div>
                  <div className={style.circle}>
                      <span className={style.valueInCircle}>{analytics.ttlMoney.toFixed(2)}</span>
                      <span className={style.keyInCircle}>ШЕКЕЛЕЙ</span>
                  </div>
              </div>
              <ul className={style.alerts}>
                  <li>* Если у работы есть перерыв, то его время вычитается из вашего заработка</li>
              </ul>
              <table>
                  <thead>
                      <tr>
                          <th>День</th>
                          <th>Место</th>
                          <th>Интервал</th>
                          <th>Часов*</th>
                          <th>₪/час</th>
                          <th>₪</th>
                      </tr>
                  </thead>
                  <tbody>
                      {shifts?.map(shift => (
                          <tr key={shift.id}>
                              <td>{shift.day}</td>
                              <td>{shift.place}</td>
                              <td>{shift.interval}</td>
                              <td>{shift.time.hours}:{shift.time.minutes} {+shift.break ? `(-${shift.break})` : ''}</td>
                              <td>{shift.salary}</td>
                              <td>{shift.money}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </>
    );
};

export default ShiftsWorkerWOAgent;