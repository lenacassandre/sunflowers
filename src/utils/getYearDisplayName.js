export default function getYearDisplayName(start, end) {
  if (start) {
    const startingYear = start.getFullYear();
    let nameString = String(startingYear);

    if (end) {
      const endingYear = end.getFullYear();

      if (endingYear !== startingYear) {
        nameString += ` / ${String(endingYear)}`;
        return nameString;
      } else {
        return nameString;
      }
    } else {
      return nameString;
    }
  } else {
    return "-";
  }
}
