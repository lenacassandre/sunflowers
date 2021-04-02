export default function nameCH(value) {
    if (value.length) {
        let string = value;

        //Suppression des caractères indésirables
        string = string.replace(/[^0-9]/g, "");

        //Suppresion des caractères autres que 0  au début
        string = string.replace(/^[^0]/g, "");

        //Espace tout les 2 chiffres
        string = string.replace(
            /^([0-9]{2}) ?([0-9]{2})? ?([0-9]{2})? ?([0-9]{2})? ?([0-9]{2})?/g,
            (match, $1, $2, $3, $4, $5) => {
                let tel = "";
                [$1, $2, $3, $4, $5].forEach((number, index) => {
                    tel += number ? number + " " : "";
                });

                return tel;
            }
        );

        //Limite la taille à 15 caractères
        string = string.replace(/^([0-9 ]{15})(.)*/g, "$1");

        string = string.trim();

        return string;
    } else {
        return "";
    }
}
