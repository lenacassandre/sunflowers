import { dateFormatFR } from "../constants/calendarInfos";

export default class DayModel {
  date: Date;
  start: Date;
  end: Date;

  weekDay: string;
  day: string;
  month: string;
  year: string;

  visible?: boolean;

  // Unique string for each day. Pretty much like an UID
  key: string;

  // Lors de la déclaration d'un jour dans une semaine, on lui fourni une date qui
  // va être traitée de façon à en extraire toute les données.
  constructor(date: Date) {
    this.date = new Date(date);

    //@ts-ignore
    const dayFR = date.toLocaleDateString("fr", dateFormatFR).split(" ");
    this.weekDay = dayFR[0];
    this.day = dayFR[1];
    this.month = dayFR[2];
    this.year = dayFR[3];
    this.visible = undefined;

    // unique identifier
    this.key = String(date.getFullYear() + date.getMonth() + date.getDate());

    // SET START
    const navDate = new Date(date);
    navDate.setHours(0);
    navDate.setMinutes(0);
    navDate.setSeconds(0);
    this.start = new Date(navDate);

    // SET END
    navDate.setHours(23);
    navDate.setMinutes(59);
    navDate.setSeconds(59);
    this.end = new Date(navDate);
  }

  includes = (date: Date) =>
    this.start.getTime() <= date.getTime() &&
    date.getTime() <= this.end.getTime();
}