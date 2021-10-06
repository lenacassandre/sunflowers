export function search<T>(array: T[], searchKeys: (keyof T)[], searchString: string) {
    if (searchString.length > 0) {
        // On divise la recherche en mots
        const words = searchString.trim().toLowerCase().split(" ");

        // Nombre de searchKeys auquelles répondent la valeur
        const searchScore = array.map((item) => {
        // Score d'une entrée du tableau
        let score = 0;

        // Pour chaque search key, on voit si l'entrée y répond,
        // si oui, on incrémente son score
        searchKeys.forEach((key) => {
            // On fait ça pour chaque mot
            words.forEach((word) => {
                if(item[key]) {
                    const objectProperty = String(item[key]).trim().toLowerCase();

                    // Incrémente si un searchKey inclue un mot
                    if (objectProperty.includes(word)) {
                        score += 1;
                    }

                    // ou si mot inclue un searchKey
                    if (word.includes(objectProperty)) {
                        score += 1;
                    }

                    // Incrémente si un mot est égal à un searchKey
                    if (objectProperty === word.toLowerCase()) {
                        score += 1;
                    }

                    // Incrémente si la recherche est égal à un searchKey
                    if (objectProperty === searchString.trim().toLowerCase()) {
                        score += 1;
                    }
                }
            });
        });

        return score;
        });

        const maxScore = Math.max(...searchScore);

        let searchResults: T[] = [];

        // Build the new array, sorting entries by score
        if (searchString.length > 0 && maxScore > 0) {
            for (let n = maxScore; n > 0; n -= 1) {
                searchScore.forEach((score, index) => {
                    if (score === n) {
                        searchResults.push(array[index]);
                    }
                });
            }
        }

        return searchResults
    } else {
        return array;
    }
}