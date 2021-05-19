import React, { useEffect, useState } from "react";
import { ViewComponent, Calendar, MiniCalendar, CheckBoxes, CheckBox, CalendarConfig } from "../../../../src";
import {User} from '../../models/User.model';
import { StoreType } from './script.store';
import {RepositoriesType} from '../../models'
import { TimeSlot } from "../../components/TimeSlot/TimeSlot";
import "./style.scss";

export type TimeSlotType = {
    start: number,
    end: number,
    day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
}

export type CalendarTimeSlot = {
    id: string,
    date: Date,
    duration: number,
}

const baseDateString = '1970-01-05';

const calendarConfig: Partial<CalendarConfig<CalendarTimeSlot, "id">> = {
    dayNumber: false,
    firstDayOfWeek: "monday",
    day: new Date(baseDateString), // Le premier lundi du système de date
    displayMode: "week",
    days: 7,
    dayWidth: 100,
	focusLayer: false,
	highlightDraggedTask: false,
	highlightPadding: 0,
	ghost: false
}

const idGenerator = () => String(Math.round(Math.random() * 10000000000))

const timeSlots: TimeSlotType[]  = []

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const dayFRtoEN: {
    "lundi": "monday",
    "mardi": "tuesday",
    "mercredi": "wednesday",
    "jeudi": "thursday",
    "vendredi": "friday",
    "samedi": "saturday",
    "dimanche": "sunday"
} = {
    "lundi": "monday",
    "mardi": "tuesday",
    "mercredi": "wednesday",
    "jeudi": "thursday",
    "vendredi": "friday",
    "samedi": "saturday",
    "dimanche": "sunday"
}

export const dayENtoFR: {
    "monday": "lundi",
    "tuesday": "mardi",
    "wednesday": "mercredi",
    "thursday": "jeudi",
    "friday": "vendredi",
    "saturday": "samedi",
    "sunday": "dimanche"
} = {
    "monday": "lundi",
    "tuesday": "mardi",
    "wednesday": "mercredi",
    "thursday": "jeudi",
    "friday": "vendredi",
    "saturday": "samedi",
    "sunday": "dimanche"
}

export const dayENtoIndex: {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6
} = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Main: ViewComponent<User, StoreType> = (view): JSX.Element => {
    // Les timeSlots doivent être adaptés au système du calendrier. Une mise à jour du Calendar est prévue pour ne pas avoir à faire ça.
    const [tasks, setTasks] = useState<CalendarTimeSlot[]>([])

    // Convertie les timeSlots en tasks pour le composant Calendar. Un mise à jour du Calendar est prévue pour ne pas avoir à passer par là.
    useEffect(() => {
        setTasks(
            timeSlots.map(ts => {
                const id = idGenerator();

                const duration = ts.end - ts.start;

                // Converting weekday to a date with the baseDateString
                const date = new Date(baseDateString);
                const weekDayIndex = dayENtoIndex[ts.day] || 0;
                date.setDate(date.getDate() + weekDayIndex)
                date.setHours(0);
                date.setMinutes(ts.start);

                return {id, date, duration}
            })
        )
    }, [])

    const add = (newTask: {date: Date, duration: number}) => {
        const id = idGenerator();

        const newTaskObject = {...newTask, id}

        setTasks([...tasks, newTaskObject])

        return newTaskObject;
    }

    const update = (task: CalendarTimeSlot, patch: {date?: Date, duration?: number}) => {
        setTasks(tasks.map(t => {
            if(t.id === task.id) {
                return {...t, ...patch}
            }
            else {
                return t
            }
        }))
    }

    return (
        <div className="Calendrier">
            <Calendar<CalendarTimeSlot, "id">
                config={calendarConfig}
                tasks={tasks}
                onPost={(newTask) => add(newTask)}
                onPatch={(task, patch) => update(task, patch)}
                renderWeekTask={() => <TimeSlot />}
            />
        </div>
    )
};

export default Main