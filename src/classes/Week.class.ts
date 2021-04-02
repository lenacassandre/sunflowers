import Day from './Day.class';
import { dateFormatFR } from '../constants/calendarInfos';

/******************************************************************************** */
/******************************  Week  ************************************** */
/******************************************************************************** */
export default class WeekModel {
    start: Date;
    end: Date;
    days: Day[]

    // Lors de la création d'une semaine dans le tableau, on lui fourni d'abord la date, et
    // les jours de la semaines sont automatiquement générés.
    // Week n'est pas un component. Il sert à contenir un tableau de component Day
    constructor(date: Date) {
        this.days = []

        const navDate = new Date(date);

        //Trouve le premier jour de la première semaine
        //@ts-ignore
        while (navDate.toLocaleTimeString('fr', dateFormatFR).split(' ')[0] !== 'lundi') {
            navDate.setDate(navDate.getDate() - 1);
        }

        // enregistrement du début et de la fin de la semaine
        this.start = this.setStart(navDate);
        this.end = this.setEnd(navDate);

        // Crée tous les jours de la semaine
        for (let j = 1; j <= 7; j += 1) {
            this.days.push(new Day(navDate));
            navDate.setDate(navDate.getDate() + 1);
        }
    }

    // tableau des jours de la semaine


    setStart(date: Date) {
        const start = new Date(date);
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);
        start.setMilliseconds(0);
        this.start = start;
        return new Date(start)
    }

    setEnd(date: Date) {
        const end = new Date(date);
        end.setDate(end.getDate() + 6);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        end.setMilliseconds(999);
        this.end = end;
        return new Date(end)
    }

    getDayFromDate = (date: Date) => {
        return this.days.filter((day) => day.date.getDate() === date.getDate())[0];
    };

    includes = (date: Date) => {
        return this.start <= date && date <= this.end;
    };
}
