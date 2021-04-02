import oMap from './oMap';

// This function able to deep updating an object over multiple sub-objects

export default function oUpdate(object, update, directMode) {
    // directMode will directly update the instance of the object,
    // non directMode will return a new instance
    if (!directMode) {
        object = { ...object };
    }

    function browseObject(obj, upd) {
        oMap(upd, (key, val) => {
            if (obj[key]) {
                // Set forcé. On ne va pas plus loin dans la valeur/l'objet si :
                if (
                    // Il n'est pas considéré comme objet
                    typeof val !== 'object' ||
                    // C'est une date
                    val instanceof Date ||
                    // C'est un tableau
                    val instanceof Array ||
                    // Il est null. typeof null === 'object'. ¯\_(ツ)_/¯
                    val === null
                ) {
                    obj[key] = val;
                } else {
                    browseObject(obj[key], upd[key]);
                }
            } else {
                obj[key] = val;
            }
        });
    }

    browseObject(object, update);

    return object;
}
