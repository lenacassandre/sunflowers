export default function oMap(object, callback) {
    return Object.fromEntries(
        Object.entries(object).map(([key, value], index) => [key, callback(key, value, index)])
    );
}
