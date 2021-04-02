/**
 * La classe OverlapRegion sert à calculer le positionnement des tâches dans le
 * calendrier. Elle permet d'analyser leur date et leur durée afin de ne pas les superposer
 * en adaptant leur taille et largeur en fonction des autres.
 */

///////////////////////////////////////////////////////////////////////////////////
// Type sans les méthodes, uniquement les propriétés du type passé
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

// Colonnes
type Column = Array<(NonFunctionProperties<Task> & {width: number})>

///////////////////////////////////////////////////////////////////////////////
export default class OverlapRegionModel {
  tasks: Task[]
  start: Date;
  end: Date;

  constructor(task: Task) {
    this.start = this.setStart(task.date);

    const taskEnd = new Date(task.date);
    taskEnd.setMinutes(
      taskEnd.getMinutes() + (task.deadline ? 15 : task.duration)
    );
    this.end = this.setEnd(taskEnd);

    this.tasks = [task];
  }


  getColumns() {
    const columns: Array<Column> = [];
    let tasks = [...this.tasks];

    // informations about the column being created
    let colStart;;
    let colEnd;

    // Each time a task is pushed in a column, its removed from the tasks array
    const push = (task: Task, col: number) => {
      if (!columns[col]) {
        columns[col] = [];
      }

      tasks.splice(tasks.indexOf(task), 1);
      columns[col].push({ ...task, width: 1 });

      // Mise à jour du début de la région
      if (!colStart || task.date < colStart) {
        colStart = new Date(task.date);
      }

      const taskEnd = new Date(task.date);
      taskEnd.setMinutes(
        taskEnd.getMinutes() + (task.deadline ? 15 : task.duration)
      );

      // Mise à jour de la fin de la région
      if (!colEnd || taskEnd > colEnd) {
        colEnd = taskEnd;
      }
    };

    let n = 0;

    const find = (task: Task) => !this.overlap(task, colStart, colEnd);

    while (tasks.length > 0) {
      // Create a new column and push to it the first task
      if (!columns[n]) {
        columns[n] = [];
        tasks = this.sort(tasks);
        push(tasks[0], n);
      }

      const noOverlapTask = tasks.find(find);

      if (noOverlapTask) {
        push(noOverlapTask, n);
      } else {
        n++;
        colStart = null;
        colEnd = null;
      }
    }

    // Les colonnes ne peuvent avoir des tailles différentes qu'à partir du moment où elles sont au moins 3
    if (columns.length >= 3) {
      // Pour toutes les colonnes
      for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
        // Pour toutes les tâches de la colonne
        for (
          let taskIndex = 0;
          taskIndex < columns[colIndex].length;
          taskIndex += 1
        ) {
          const task = columns[colIndex][taskIndex];

          // Nombre de colonnes après qui sont disponible
          let width = 1;

          // Pour toutes les colonnes après celle de cette tâche
          loop3: for (
            let colIndexForTask = colIndex + 1;
            colIndexForTask < columns.length;
            colIndexForTask += 1
          ) {
            // Pour toutes les tâches des colonnes après celle de la tâche taskIndex
            for (
              let taskIndexForTask = 0;
              taskIndexForTask < columns[colIndexForTask].length;
              taskIndexForTask += 1
            ) {
              if (
                colIndex !== colIndexForTask ||
                taskIndex !== taskIndexForTask
              ) {
                const secondTask = columns[colIndexForTask][taskIndexForTask];
                const secondTaskEnd = new Date(secondTask.date);
                secondTaskEnd.setMinutes(
                  secondTaskEnd.getMinutes() +
                    (secondTask.deadline ? 15 : secondTask.duration)
                );

                if (this.overlap(task, secondTask.date, secondTaskEnd)) {
                  break loop3;
                }
              }
            }

            width += 1;
          }

          task.width = width;
        }
      }
    }

    return columns;
  }

  getTimeMinutes(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  includes = (task: Task) => {
    return this.overlap(task, this.start, this.end);
  };

  // Vérifie si une task chevauche une période donnée
  overlap(task: Task | NonFunctionProperties<Task>, start: Date, end: Date) {
    const taskStart = task.date;
    const taskEnd = new Date(task.date);
    taskEnd.setMinutes(
      taskEnd.getMinutes() + (task.deadline ? 15 : task.duration)
    );

    return (
      // start of the task is in the region
      (start <= taskStart && taskStart < end) ||
      // end of the task is in the region
      (start < taskEnd && taskEnd <= end) ||
      // start of the region is in the task
      (taskStart <= start && start < taskEnd) ||
      // end of the region is in the task
      (taskStart < end && end <= taskEnd)
    );
  }

  push = (task: Task) => {
    this.tasks.push(task);

    if (task.date.getTime() < this.start.getTime()) {
      this.setStart(task.date);
    }

    const taskEnd = new Date(task.date);
    taskEnd.setMinutes(
      taskEnd.getMinutes() + (task.deadline ? 15 : task.duration)
    );

    if (taskEnd.getTime() > this.end.getTime()) {
      this.setEnd(taskEnd);
    }
  };

  setStart = (date: Date) => {
    this.start = new Date(date);
    return new Date(date);
  };

  setEnd = (date: Date) => {
    this.end = new Date(date);
    return new Date(date);
  };

  sort(tasksArray: Task[]) {
    return tasksArray.sort((a, b) => {
      return this.getTimeMinutes(a.date) > this.getTimeMinutes(b.date)
        ? 1
        : this.getTimeMinutes(a.date) < this.getTimeMinutes(b.date)
        ? -1
        : (a.deadline ? 15 : a.duration) < (b.deadline ? 15 : b.duration)
        ? 1
        : (a.deadline ? 15 : a.duration) > (b.deadline ? 15 : b.duration)
        ? -1
        : a.promotions.length > b.promotions.length
        ? 1
        : a.promotions.length < b.promotions.length
        ? -1
        : a.tarif < b.tarif
        ? 1
        : a.tarif > b.tarif
        ? -1
        : a._id && b._id && a._id > b._id
        ? 1
        : -1;
    });
  }
}
