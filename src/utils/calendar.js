export const computeCalendar = (year=null, month=null) => {
    const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    const daysWeek = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

    const date = new Date();
    year = year ?? date.getFullYear();
    month = month ?? date.getMonth();
    const day = date.getMonth() === month ? date.getDate() : null;

    const dateByLastDayPrevMonth = new Date(year, month, 0);
    const totalDaysPrevMonth = dateByLastDayPrevMonth.getDate();
    const lastDayWeekPrevMonth = dateByLastDayPrevMonth.getDay();

    const dateByLastDay = new Date(year, month+1, 0);
    const totalDays = dateByLastDay.getDate();
    const firstDayWeek = lastDayWeekPrevMonth + 1 > 6 ? 0 : lastDayWeekPrevMonth+1;
    const totalDaysWeek = 6;

    const dateByLastDayNextMonth = new Date(year, month+2, 0);

    const weeks = [];
    let counter = 0;
    let counterNextMonth = 0;
    for(let i = 0; i < totalDaysWeek; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
            if (!weeks.length && j < firstDayWeek) {
                week.push({
                    value: totalDaysPrevMonth-lastDayWeekPrevMonth+j,
                    inPastMonth: true
                });
            } else {
                counter += 1;
                if (counter <= totalDays) {
                    week.push({
                        value: counter,
                        inCurrentMonth: true,
                        dayOff: j === 6,
                        current: counter === day,
                        enabled: counter > day && j !== 6
                    });
                } else {
                    counterNextMonth += 1;
                    week.push({
                        value: counterNextMonth,
                        inNextMonth: true
                    });
                }
            }
        }
        weeks.push(week)
    }

    return {
        prevMonth: dateByLastDayPrevMonth.getMonth(),
        prevYear: dateByLastDayPrevMonth.getFullYear(),
        nextMonth: dateByLastDayNextMonth.getMonth(),
        nextYear: dateByLastDayNextMonth.getFullYear(),
        monthName: months[month],
        year,
        month,
        daysWeek,
        weeks
    }
};