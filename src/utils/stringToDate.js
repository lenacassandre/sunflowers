export default function stringToDate(string) {
	// 30 juillet 1996
	if (string.match(/[0-9]{1,2} [A-Za-z]+ [0-9]{2,4}/g)) {
		const mois = [
			'janvier',
			'février',
			'mars',
			'avril',
			'mai',
			'juin',
			'juillet',
			'août',
			'septembre',
			'octobre',
			'novembre',
			'décembre'
		];

		const [day, month, year] = string.split(' ');
		return new Date(year + '-' + ('0' + String(mois.indexOf(month) + 1)).slice(-2) + '-' + day);
	}
	// 30/07/1996
	else if (string.match(/[0-3][0-9]\/[0-1][0-9]\/[0-9]{4}/g)) {
		const [day, month, year] = string.split('/');
		return new Date(year + '-' + month + '-' + day);
	}
	// 1996/07/30
	else if (string.match(/[0-9]{4}\/[0-1][0-9]\/[0-3][0-9]/g)) {
		const [year, month, day] = string.split('/');
		return new Date(year + '-' + month + '-' + day);
	}
	// 30071996
	else if (string.match(/[0-3][0-9][0-1][0-9][0-9]{4}/g)) {
		const year = string.substring(4, 8);
		const month = string.substring(2, 4);
		const day = string.substring(0, 2);
		return new Date(year + '-' + month + '-' + day);
	}
	// 19960730
	else if (string.match(/[0-9]{4}[0-1][0-9][0-3][0-9]/g)) {
		const year = string.substring(0, 4);
		const month = string.substring(4, 6);
		const day = string.substring(6, 8);
		return new Date(year + '-' + month + '-' + day);
	}
}
