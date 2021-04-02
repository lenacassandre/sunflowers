export default function oSort(object) {
	const sortable = [];
	for (let key in object) {
		sortable.push([key, object[key]]);
	}

	sortable.sort(function(a, b) {
		return b[1] - a[1];
	});

	var objSorted = {};
	sortable.forEach(function(item) {
		objSorted[item[0]] = item[1];
	});

	return objSorted;
}
