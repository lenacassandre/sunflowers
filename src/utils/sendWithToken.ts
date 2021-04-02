export default function (object: any) {
	if (typeof object === "object") {
		return { ...object, token: localStorage.getItem("token") };
	} else {
		return { token: localStorage.getItem("token") };
	}
}
