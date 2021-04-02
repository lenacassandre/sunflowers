//Rajoute un "0" devant la string si elle ne contient qu'un caractère. Ex: "6" -> "06", "12" -> "12"
export default function formatNumber(match) {
    match = String(match);
    return match.length === 1 ? "0" + match : match;
}
