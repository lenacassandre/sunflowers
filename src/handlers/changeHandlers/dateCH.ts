// "1/" => "01/"
// 32/ => 31/
// 245 => 24

import formatNumber from "../../utils/formatNumber";

function replaceOccurrence(string, regex, n, replace) {
  let i = 0;
  return string.replace(regex, function (match) {
    i += 1;
    if (i === n) return replace;
    return match;
  });
}

export default function dateCH(string: string, backward: boolean) {
  const [d, m, y] = string.split("/");

  // Limitation à 9 caractères
  string = string.slice(0, 10);

  // Remplacement de tout ce qui n'est ni nombre, ni slash, par un slash
  string = string.replace(/[^0-9\/]/g, "/");

  // Suppression des "/" consécutifs
  string = string.replace(/\/+/g, "/");

  // Suppression des slashs en début de string
  string = string.replace(/^\//, "");

  let monthInt;

  // Limitation des mois
  string = string.replace(/([0-9]+\/)([0-9]+)(.*)/g, (m, day, month, end) => {
    // Limitation à deux caractères
    month = month.slice(0, 2);

    // limitation à 12
    month = parseInt(month, 10) > 12 ? "12" : month;

    monthInt = parseInt(month, 10);

    return `${day}${month}${end ? end : ""}`;
  });

  console.log("string after month control", string);

  // Limitation des jours
  string = string.replace(/^[0-9]+/g, (day) => {
    // Limitation à deux caractères
    day = day.slice(0, 2);

    // Le dernier jour du mois
    const maxDayInMonth = new Date(
      (y && y.length === 4 ? parseInt(y, 10) : undefined) || 2020,
      monthInt || 1,
      0
    ).getDate();

    // limitation
    day = parseInt(day, 10) > maxDayInMonth ? String(maxDayInMonth) : day;

    return day;
  });

  console.log("string after day control", string);

  // Formatage des nombre pour répondre
  string = string.replace(/([0-9]+)(\/)/g, (m, number, slash) => {
    console.log(
      number,
      slash,
      number.length,
      number.length === 1 ? formatNumber(number) : number
    );

    return `${
      number.length === 1 ? formatNumber(number < 1 ? 1 : number) : number
    }${slash}`;
  });

  console.log("string after format", string);

  // slash auto après le jour
  string = !backward
    ? string.replace(/^[0-9]{2}$/g, (match) => `${match}/`)
    : string;

  // slash auto après le mois
  string = !backward
    ? string.replace(/^[0-9]{2}\/[0-9]{2}$/g, (match) => `${match}/`)
    : string;

  // Supprime le troisième slash
  string = replaceOccurrence(string, /\//g, 3, "");

  return string;
}
