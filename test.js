const process = require("process");
const target = {
    a: "",
    b: "",
};
const keys = ["a", "b"];
let index = 0;
process.stdin.on("data", a);

console.log("Oi");

function getString(data) {
    return data.toString().replace(/(\r\n|\n|\r)/gm, "");
}

function registerInputListener(listener) {
    process.stdin.on("data", listener);
}

function unregisterInputListener(listener) {
    process.stdin.off("data", listener);
}

function pauseInput() {
    process.stdin.pause();
}

function a(data) {
    target.a = getString(data);
    process.stdin.off("data", a);
    process.stdin.on("data", b);
}
function b(data) {
    target.b = getString(data);
    process.stdin.off("data", b);
    process.stdin.pause();
}
