export default function forDateToDate(start, end, step, inclusive, callback) {
    if (typeof start === 'string' && typeof end === 'string') {
        //Début de la boucle
        const startTime = new Date();
        startTime.setHours(start.replace(/^([0-9]+):[0-9]+$/, '$1'));
        startTime.setMinutes(start.replace(/^[0-9]+:([0-9]+)$/, '$1'));
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);

        //Fin de la boucle
        const endTime = new Date();
        endTime.setHours(end.replace(/^([0-9]+):[0-9]+$/, '$1'));
        endTime.setMinutes(end.replace(/^[0-9]+:([0-9]+)$/, '$1'));
        endTime.setSeconds(0);
        endTime.setMilliseconds(0);

        //Instance de Date qui permet de parcourir le temps

        let passingTime = new Date(startTime);

        let index = 0;

        while (
            (inclusive && passingTime.getTime() <= endTime.getTime()) ||
            (!inclusive && passingTime.getTime() < endTime.getTime())
        ) {
            //callback - clé unique, int: hour, int: minutes, int: delta : différence de temps entre le début de la boucle et maintenant en ms
            callback(
                new Date(passingTime),
                index,
                passingTime.getHours(),
                passingTime.getMinutes(),
                passingTime.getTime() - startTime.getTime()
            );

            // +15mn
            passingTime.setMinutes(passingTime.getMinutes() + step);
            index += 1;
        }
    }
}
