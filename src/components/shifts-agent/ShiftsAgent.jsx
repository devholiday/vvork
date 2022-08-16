import {useEffect, useState} from "react";
import {collection, getDocs, getFirestore, query, where, doc, getDoc} from "firebase/firestore";
import {getAuth} from "firebase/auth";

import style from './ShiftsAgent.module.css';

const ShiftsAgent = () => {
    const db = getFirestore();
    const auth = getAuth();

    const [calendar, setCalendar] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [analytics, setAnalytics] = useState({ttlHours: 0, ttlMoney: 0});
    const [jobInvitations, setJobInvitations] = useState([]);
    const [workerId, setWorkerId] = useState(null);

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
            const jobInvitations = await getJobInvitations();
            setJobInvitations(jobInvitations);
        }

        fetchData();
    }, []);
    useEffect(() => {
        if (!workerId) return;

        setCalendar(computeCalendar(null, null));
        setAnalytics({ttlHours: 0, ttlMoney: 0});

        const fetchData = async () => {
            console.log(workerId)
            const shifts = await getComplexShifts(workerId);
            setShifts(shifts);
        }

        fetchData();
    }, [workerId]);

    const getJobInvitations = async () => {
        try {
            const q = query(collection(db, "jobInvitations"),
                where("agentId", "==", auth.currentUser.uid),
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
    const getShifts = async (workerId, year, month) => {
        try {
            const q = query(collection(db, "shifts"),
                where("workerId", "==", workerId),
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
        const docRef = doc(db, "works", workId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    };
    const getJobInvitation = async (workId, workerId) => {
        try {
            const q = query(collection(db, "jobInvitations"),
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

    const getComplexShifts = async (workerId, year=new Date().getFullYear(), month=new Date().getMonth()) => {
        const shiftsData = await getShifts(workerId, year, month);
        const shifts = [];

        for (const shift of shiftsData) {
            const work = await getWorkById(shift.workId);
            const jobInvitation = await getJobInvitation(shift.workId, workerId);

            const {start, end} = shift.time;

            const hours = +(24-start.hours) + +end.hours;
            const startMins = +start.minutes;
            const endMins = +end.minutes;

            const startMinutes = 60 - +(!startMins ? 60 : startMins);
            const startMinutesToHour = +((startMinutes / 60).toFixed(2))
            const endMinutesToHour = +((endMins / 60).toFixed(2));
            const minutesToHour = startMinutesToHour+endMinutesToHour-30/60;

            setAnalytics(prevState => {
                prevState.ttlHours += hours+minutesToHour;
                prevState.ttlMoney += +jobInvitation.salary * (hours+minutesToHour);

                return prevState;
            });

            shifts.push({
                id: shift.id,
                day: shift.day,
                place: work.shortTitle,
                interval: `${start.hours}:${start.minutes}-${end.hours}:${end.minutes}`,
                hours: hours+minutesToHour,
                salary: jobInvitation.salary,
                money: +jobInvitation.salary * (hours+minutesToHour)
            });
        }

        return shifts;
    }

    const goToPrevMonth = async () => {
        setCalendar(computeCalendar(calendar?.prevYear, calendar?.prevMonth));

        setAnalytics({ttlHours: 0, ttlMoney: 0});

        const shifts = await getComplexShifts(workerId, calendar?.prevYear, calendar?.prevMonth);
        setShifts(shifts);
    }
    const goToNextMonth = async () => {
        setCalendar(computeCalendar(calendar?.nextYear, calendar?.nextMonth))

        setAnalytics({ttlHours: 0, ttlMoney: 0});

        const shifts = await getComplexShifts(workerId, calendar?.nextYear, calendar?.nextMonth);
        setShifts(shifts);
    }

    const handleChangeSelect = e => {
        const value = e.target.value;
        setWorkerId(value);
    };

    return (
      <>
          <h2>Смены рабочих</h2>

          <div className={style.selectWorker}>
              <select onChange={e => handleChangeSelect(e)}>
                  <option value=''>Выберите рабочего</option>
                  {jobInvitations?.map(j =>
                      <option key={j.id} value={j.workerId}>{j.phone} / {j.firstName}</option> )}
              </select>
          </div>

          {workerId && (
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
                          <span className={style.valueInCircle}>{analytics.ttlHours.toFixed(2).replace('.', ':')}</span>
                          <span className={style.keyInCircle}>ЧАСОВ</span>
                      </div>
                      <div className={style.circle}>
                          <span className={style.valueInCircle}>{analytics.ttlMoney.toFixed(2)}</span>
                          <span className={style.keyInCircle}>ШЕКЕЛЕЙ</span>
                      </div>
                  </div>
                  <ul className={style.alerts}>
                      <li>* С каждой смены вычитается 30 минут в качестве обязательного перерыва</li>
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
                              <td>{shift.hours.toFixed(2).replace('.', ':')}</td>
                              <td>{shift.salary}</td>
                              <td>{shift.money.toFixed(2)}</td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              </div>
          )}
      </>
    );
};

export default ShiftsAgent;