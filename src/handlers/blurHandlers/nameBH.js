export default function nameBH(value) {
    if (value.length) {
        let string = value;

        //Suppression des " ", "-" et " ' " en fin de chaine
        string = string.replace(/[ '-]$/, "");

        return string;
    } else {
        return "";
    }
}
