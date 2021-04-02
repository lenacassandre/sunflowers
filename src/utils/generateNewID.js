export default function generateNewID(array, key) {
    // key peut indiquer une autre clé pour trouver les id. Pas défault il s'agit de 'id'.
    key = key ? key : 'id';

    // Tableau contenant uniquement les id
    array = array.map((item) => item[key]);

    // nouvel id
    let n = 1;

    while (array.includes(n)) {
        n++;
    }

    return n;
}
