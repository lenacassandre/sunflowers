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

export default function emailCH(value) {
    if (value.length) {
        let string = value;

        //Suppression de tout caractère non désiré
        string = string.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9!#$%&'*+/=?^_`{}|~;.(),:;<>@[\]\\"-]+/g, "");

        //Suppression des caractères !#$%&'*+/=?^_`,:;@|~;-\ en début de chaine
        string = string.replace(/^[!#$%&'*+/=?^_`,:;@|~;\\.-]*/g, "");

        //Suppression des caractères !#$%&'*+/=?^_`{}()[],:;<>@|~;\.- consécutifs
        string = string.replace(/([!#$%&'*+/=?^_`{}()[\],:;.<>@|~;\\-])\1+/g, match => {
            return match[0];
        });

        return string;
    } else {
        return "";
    }
}
