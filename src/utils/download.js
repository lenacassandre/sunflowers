export default function download(filename, text) {
    console.log(1);
    const element = document.createElement('a');
    console.log(2);
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    console.log(3);
    element.style.display = 'none';
    document.body.appendChild(element);
    console.log(4);
    element.click();
    console.log(5);
    document.body.removeChild(element);
}
