export default function nameCH(value: string) {
    if (value.length) {
        let string = value;

        //Suppression des caractères indésirables
        string = string.replace(/[^0-9]/g, "");

        //Suppresion des caractères autres que 1 ou 2 au début
        string = string.replace(/^[^12]/g, "");

        //Espace tout les 2 chiffres
        string = string.replace(
            /^([0-9]{1}) ?([0-9]{2})? ?([0-9]{2})? ?([0-9]{2})? ?([0-9]{3})? ?([0-9]{3})? ?([0-9]{2})?/g,
            (_match, $1, $2, $3, $4, $5, $6, $7) => {
                let tel = "";
                [$1, $2, $3, $4, $5, $6, $7].forEach((number) => {
                    tel += number ? number + " " : "";
                });

                return tel;
            }
        );

        //Limite la taille à 22 caractères
        string = string.replace(/^([0-9 ]{22})(.)*/g, "$1");

        string = string.trim();

        return string;
    } else {
        return "";
    }
}
