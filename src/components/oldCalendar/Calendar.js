import React, { useEffect, memo } from "react";
import WeekModel from "../../models/Week.model";
import { monthsLength, dateFormatFR } from "../../constants/calendarInfos";
import DayBorder from "./DayBorder/DayBorder";
import DayName from "./DayName/DayName";
import Editor from "./Editor/Editor";
import HoursBar from "./HoursBar/HoursBar";

import {
  WRITE_WEEKS_ARRAY,
  WINDOW,
  CALENDAR,
  CORRECT_DATE,
} from "../../views/ReferentTeacherCalendar/RTCalendar.actions";

import OverlapRegionModel from "../../models/OverlapRegion.model";
import Task from "./Task/Task";
import "./Calendar.scss";

import { TransitionGroup, CSSTransition } from "react-transition-group";

//Retourne les presatations selon la promotion ou le groupe
export function filter(store) {
  const { promotion = [] } = store;

  let userTasksFiltered = [...store.userTasks];

  // MODE AFFICHAGE PLANNING : sans les tâches annexes
  // ou mode affichage gestion des salles
  if (store.planning || store.salle) {
    userTasksFiltered = userTasksFiltered.filter((task) => {
      if (task.tarif) {
        const tarif = store.userTarifs.find((t) => t._id === task.tarif);

        if (tarif) {
          const type = store.types.find((t) => t._id === tarif.type);

          // En mode planning ou gestion de salles, on affiche que les task qui ont un prof et un tarif.
          // On regarde ensuite si le type de la presta s'affiche pour le mode actuel
          if (
            task.tarif &&
            ((store.planning && type && type.planning && !task.cancelled) ||
              (store.salle && type && type.salle))
          ) {
            return true;
          }

          return false;
        }

        return false;
      }

      return false;
    });
  }

  if (store.salle) {
    // On map le tableau des id des faculties actuellement affichées par leur object correspondant
    const currentFaculties = store.currentFaculties
      .map((f_id) => store.userFaculties.find((f) => f._id === f_id))
      .filter((f) => f);

    return userTasksFiltered.filter((task) =>
      task.promotion.some((p) =>
        currentFaculties.some((f) => f.promotions.includes(p))
      )
    );
  }

  userTasksFiltered = userTasksFiltered.filter((item) => {
    // If no promotion has been selected,
    // the calendar shows only the items that don't concern any promotion.
    if (item.promotion.length === 0) {
      return true;
    }
    // If only one promotion has been selected,
    // the calendar shows all items concerned by this one,
    // including those that are concerned by others.
    else if (promotion.length === 1 && item.promotion.includes(promotion[0])) {
      return true;
    }
    // If multiple promotions are selected,
    // the calendar shows only the items concerned by all those promotions
    // at the same time and only those.
    else if (promotion.length > 1) {
      let included = false;
      promotion.forEach((promo) => {
        if (item.promotion.includes(promo)) {
          included = true;
        }
      });
      return included;
    } else {
      return false;
    }
  });

  const overlapingTasks = [];
  userTasksFiltered.forEach((task) => {
    if (task.overlapingTasks && task.overlapingTasks.length > 0) {
      task.overlapingTasks.forEach((oT) => {
        if (
          !userTasksFiltered.some((t) => t._id === oT._id) &&
          !overlapingTasks.some((t) => t._id === oT._id)
        ) {
          overlapingTasks.push({ ...oT, overlapingTask: true });
        }
      });
    }
  });

  return userTasksFiltered.concat(overlapingTasks);
}

function init(store, dispatch) {
  const { startingHour, endingHour, startingDate, endingDate } = store;

  // CALCUL DE LA DUREE D'UNE JOURNEE EN MINUTES///////////////////////
  const [startingMinutes, endingMinutes] = [startingHour, endingHour].map(
    (hour) => {
      const [hours, minutes] = hour
        .split(":")
        .map((item) => parseInt(item, 10));

      return hours * 60 + minutes;
    }
  );

  const dayDuration = endingMinutes - startingMinutes;

  // Check if the starting and ending dates are a Date instance
  if (!(startingDate instanceof Date) || !(endingDate instanceof Date)) {
    throw new Error(
      "Props 'startingDate' and 'endingDate' of the Calendar component must be a Date instance."
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //Trouve le premier jour de la première semaine du mois (qui peut être du mois précédent si le mois ne commence pas un lundi)

  let navDate = new Date(startingDate);
  navDate.setDate(1);

  while (
    navDate.toLocaleTimeString("fr", dateFormatFR).split(" ")[0] !== "lundi"
  ) {
    navDate.setDate(navDate.getDate() - 1);
  }

  const farStart = new Date(navDate);

  ///////////////////////////////////////////////////////////////////////////////////////
  //Trouve le dernier jour de la dernière semaine du mois (qui peut être du mois suivant si le mois ne se termine pas un dimanche)

  navDate = new Date(endingDate);
  navDate.setDate(monthsLength[navDate.getMonth()]);

  while (
    navDate.toLocaleTimeString("fr", dateFormatFR).split(" ")[0] !== "dimanche"
  ) {
    navDate.setDate(navDate.getDate() + 1);
  }

  const farEnd = new Date(navDate);

  ///////////////////////////////////////////////////////////////////////////////////////
  // Génère toutes les semaines du calendrier

  navDate = new Date(farStart);
  const weeks = [];

  while (navDate.getTime() <= farEnd.getTime()) {
    weeks.push(new WeekModel(navDate));

    // Semaine suivante
    navDate.setDate(navDate.getDate() + 7);
  }

  // ECRITURE DU TABLEAU
  dispatch({
    type: WRITE_WEEKS_ARRAY,
    data: { weeksArray: weeks, dayDuration, startingMinutes, endingMinutes },
  });
}

function getWeekFromDate(store, date) {
  return (
    store.weeksArray &&
    store.weeksArray.find((week) => {
      return week.includes(date);
    })
  );
}

function minutesToPercents(store, minutes) {
  return (minutes / store.dayDuration) * 100;
}

/******************************************************************************** */
/******************************  Calendar  ************************************** */
/******************************************************************************** */

function Calendar({ store, dispatch, notify, modal, readOnly }) {
  /******************************************************************************** */
  /* Lyfe cycle ***********************************************************************/
  /******************************************************************************** */
  const mouseDown = (event) =>
    dispatch({ type: WINDOW.MOUSE_DOWN, event, data: "calendar" });
  const mouseUp = (event) => dispatch({ type: WINDOW.MOUSE_UP, event });
  const mouseMove = (event) => dispatch({ type: WINDOW.MOUSE_MOVE, event });
  const keyDown = (event) => dispatch({ type: WINDOW.KEY_DOWN, event });

  useEffect(() => {
    init(store, dispatch);

    window.addEventListener("keydown", keyDown);

    if (!readOnly) {
      window.addEventListener("mousedown", mouseDown);
      window.addEventListener("mouseup", mouseUp);
      window.addEventListener("mousemove", mouseMove);
    }

    return () => {
      window.removeEventListener("keydown", keyDown);

      if (!readOnly) {
        window.removeEventListener("mousedown", mouseDown);
        window.removeEventListener("mouseup", mouseUp);
        window.removeEventListener("mousemove", mouseMove);
      }
    };
  }, []);

  // Le tableau de données a t-il été généré ?
  const ready = () => {
    return store.weeksArray && store.weeksArray.length > 0;
  };

  /******************************************************************************** */
  /* Render **** ********************************************************************/
  /******************************************************************************** */

  const week = getWeekFromDate(store, store.date);

  if (!week) {
    setTimeout(() => dispatch({ type: CORRECT_DATE }));
    return "Chargement...";
  }

  if (ready()) {
    const tasks = filter(store);

    let tasksComponents = [];
    const daysBorder = [];
    const daysName = [];

    let taskRectForEditor;

    let daysArray = [];
    if (store.mode === 1) {
      const day = week.days.find((d) => d.includes(store.date));
      console.log("date", store.date);
      console.log("week", week);
      console.log("day", day);
      if (day) {
        daysArray = [day];
      } else {
        daysArray = [week.days[0]];
        notify("Erreur Calendar : jour introuvable.", "red");
      }
    } else if (store.mode === 5) {
      daysArray = week.days.slice(0, 5);
    } else {
      daysArray = week.days;
    }

    daysArray.forEach((day, dayIndex) => {
      /********************************************************************************* */
      /*******************  CALCUL DES CHEVAUCHEMENTS  ********************************* */
      /********************************************************************************* */
      const tasksOftheDay = tasks.filter((task) => {
        return day.includes(task.date);
      });

      const overlapRegions = [];

      const newRegion = (task) =>
        overlapRegions.push(new OverlapRegionModel(task));

      tasksOftheDay.forEach((task) => {
        const oRs = overlapRegions.filter((o) => o.includes(task));

        // If the task belong to one region
        if (oRs.length === 1) {
          // pushing it to the existing region
          oRs[0].push(task);
        }
        // If the task belong to multiple regions
        else if (oRs.length > 1) {
          // Creating a new region
          newRegion(task);
          // Pushing all the tasks of all the regions to this new region
          oRs.forEach((oR) => {
            oR.tasks.forEach((task) =>
              overlapRegions[overlapRegions.length - 1].push(task)
            );
            // Remove those regions from the regions table
            const index = overlapRegions.indexOf(oR);
            overlapRegions.splice(index, 1);
          });
        }
        // If the task belong to no region
        else {
          newRegion(task);
        }
      });

      const grids = overlapRegions.map((o) => o.getColumns());

      /********************************************************************************* */
      /*******************  GENERATION DES TASKS ********************************* */
      /********************************************************************************* */

      const dayWidth = 100 / store.mode;
      const innerDayWidth = 90 / store.mode;

      let dayLeft = dayWidth * dayIndex;

      daysBorder.push(
        <DayBorder key={day.key} left={dayLeft} width={dayWidth} />
      );
      daysName.push(
        <DayName
          key={day.key}
          date={store.date}
          day={day}
          left={dayLeft}
          width={dayWidth}
        />
      );

      // GENERATE TASK CARDS
      grids.forEach((columns) =>
        columns.forEach((col, n) =>
          col.forEach((task) => {
            const start = store.startingHour.split(":");
            const startHour = new Date(task.date);
            startHour.setHours(parseInt(start[0], 10));
            startHour.setMinutes(parseInt(start[1], 10));
            const deltaHour =
              (task.date.getTime() - startHour.getTime()) / 60000;

            // Position de la task sur le jour
            const top = minutesToPercents(store, deltaHour);

            // Position de la task dans la semaine et dans le jour
            const left = dayLeft + (innerDayWidth / columns.length) * n;

            // Hauteur de la task
            const height = task.deadline
              ? minutesToPercents(store, 15)
              : minutesToPercents(store, task.duration);

            // Largeur de la task
            const width = (innerDayWidth / columns.length) * task.width;

            if (task._id === store.editor) {
              // save editor position
              taskRectForEditor = {
                top,
                left,
                height,
                width,
              };
            }

            // Animation des taches annulées pour l'instant
            tasksComponents.push(
              <CSSTransition
                key={task._id}
                timeout={store.user.animations ? 200 : 0}
                classNames="taskTransition"
              >
                <Task
                  task={task}
                  store={store}
                  top={top}
                  height={height}
                  width={width}
                  left={left}
                  div={(1 / store.mode) * (task.width / columns.length)}
                  dispatch={dispatch}
                  readOnly={readOnly}
                />
              </CSSTransition>
            );
          })
        )
      );
    });

    tasksComponents = tasksComponents.sort((a, b) => (a.key > b.key ? 1 : -1));

    return (
      <div
        className={`Calendar ${
          !store.user.animations
            ? "noAnimation"
            : store.animation
            ? store.animation
            : ""
        }`}
      >
        {/* BARRE DES JOURS DU HAUT */}
        <TransitionGroup className="daysBarWrapper">
          <div className="daysBarWrapperBorder" />
          <CSSTransition
            timeout={store.user.animations ? 500 : 0}
            key={store.date}
          >
            <div className="daysBar">{daysName}</div>
          </CSSTransition>
        </TransitionGroup>

        {/* GRILLE */}
        <div
          className={`grid${store.planning || readOnly ? " planning" : ""}`}
          onMouseDown={(event) =>
            !readOnly &&
            !store.planning &&
            dispatch({ type: CALENDAR.MOUSE_DOWN, event })
          }
          ref={store.calendarRef}
        >
          {/* BORDURES VERTICALES DES JOURS */}
          <TransitionGroup className="animationBounds">
            <CSSTransition
              timeout={store.user.animations ? 500 : 0}
              key={store.date}
            >
              <div className="daysBorders">{daysBorder}</div>
            </CSSTransition>
          </TransitionGroup>

          {/* BORDURES HORIZONTALES DES HEURES */}
          <HoursBar
            startingHour={store.startingHour}
            endingHour={store.endingHour}
          />

          {/* TÂCHES */}
          <TransitionGroup className="animationBounds">
            <CSSTransition
              timeout={store.user.animations ? 500 : 0}
              key={store.date}
            >
              <div className="days">
                <TransitionGroup className={`TaskTransitionGroup`}>
                  {tasksComponents}
                </TransitionGroup>
              </div>
            </CSSTransition>
          </TransitionGroup>

          {/* EDITEUR */}
          <TransitionGroup>
            {store.editor && (
              <CSSTransition
                timeout={store.user.animations ? 200 : 0}
                key="editor"
              >
                <Editor
                  store={store}
                  dispatch={dispatch}
                  taskRect={taskRectForEditor}
                  modal={modal}
                />
              </CSSTransition>
            )}
          </TransitionGroup>
        </div>
      </div>
    );
  } else {
    return <div>Chargement...</div>;
  }
}

export default memo(Calendar, () => false);
