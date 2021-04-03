export default function nameCH(value: string) {
    if (value.length) {
        let string = value;

        //Suppression des " ' ", "-" et " " au début et tout caractère non désiré
        string = string.replace(/^[ '-]+|[^A-Za-zÀ-ÖØ-öø-ÿ '-]+/, "");

        //Uppercase la première lettre de la chaine  si elle est encore existante, et lowercase le reste du premier mot.
        string = string.replace(/(^[A-Za-zÀ-ÖØ-öø-ÿ]{0,1})([A-Za-zÀ-ÖØ-öø-ÿ]*)/, (_match, $1, $2) => {
            return $1.toUpperCase() + $2.toLowerCase();
        });

        //Uppercase les début de mots, Lowercase le reste. Suppression des doublons "-", " ' " et " ".
        string = string.replace(/([ '-]+)([A-Za-zÀ-ÖØ-öø-ÿ]{0,1})([A-Za-zÀ-ÖØ-öø-ÿ]*)/g, (_match, $1, $2, $3) => {
            return $1[0] + $2.toUpperCase() + $3.toLowerCase();
        });

        return string;
    } else {
        return "";
    }
}
