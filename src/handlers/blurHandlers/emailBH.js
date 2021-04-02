/* RÈGLES SUR LA SYNTAXE DES ADRESSES E-MAIL
 * partie-locale@domaine
 * Caractères autorisés : A-Za-zÀ-ÖØ-öø-ÿ0-9!#$%&'*+/=?^_`{}|~;.(),:;<>@[\]\\"-
 *
 * RÈGLES SUR LA SYNTAXE DE LA PARTIE LOCALE
 * 64 caractères maximum
 * Caractères A-Za-zÀ-ÖØ-öø-ÿ0-9 autorisés librement
 * Caractères !#$%&'*+/=?^_`{}()[],:;<>@|~;- autorisés de manière non consécutive
 * Caractères {}, (), [], "" autorisés si utilisés en couple
 * Caractères ()[],:;<>@ seulement dans les ""
 * Caractères " et \ autorisés si précédés d'un \ ET dans les ""
 * Les " " doivent être séparées du reste de la partie local par des . ou être la seule partie
 *
 * RÈGLES SUR LA SYNTAXE DE LA PARTIE DOMAINE
 * Caractères A-Za-z0-9 autorisés librement
 * Le domaine ne peut pas être composé uniquement de chiffres
 * Caractère - autorisé mais ni au début ni à la fin
 * Le domaine peut être une IPv4 si cette dernière est entre crochets []. Exemple : [192.168.1.2]
 * Le domaine peut être une IPv6 si cette dernière est entre crochets et écrite de la manière suivante : [IPv6:2001:db8::1]
 */

export default function emailBH(value) {
    if (value.length) {
        let string = value;

        if (string.search("@") < 0) {
            //S'il n'y a pas de @
            //return new Error("@ manquant. Ex : exemple@domaine.com");
            return string;
        } else if (string.match(/@/g).length > 1) {
            //Si il y a plusieurs @
            //return new Error("Un seul @ autorisé. Ex : exemple@domaine.com");
            return string;
        } else if (!string.match(/@[A-Za-z0-9]/g)) {
            //Si il n'y a pas de domaine
            //return new Error("Veuillez indiquer un domaine. Ex : exemple@domaine.com");
            return string;
        } else {
            return string;
        }
    } else {
        return "";
    }
}
