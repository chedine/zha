

const code1 = `(both p1 p2 = [
    v1 = p1 args
    v2 = p2 args
    and v2 v1
])`;
const code2 = `

(both p1 p2 = [
    v1 = p1 args
    v2 = p2 args
    and v2 v1
])`;
const code3 = `

(both p1 p2 = [
    v1 = p1 args
    v2 = p2 args
    and v2 v1
])

add x y
`;
const code4 = `

both p1 p2 = [
    v1 = p1 args
    v2 = p2 args
    and v2 v1
]

add x y = + x y

(add 1 3)
x
`;

const code5 = `both p1 p2 = [
    v1 = p1 args
    v2 = p2 args
    and v2 v1
]

add x y
`
/**
 * 
 */

function benchmark(fn) {
    console.time("b");
    fn();
    console.timeEnd("b");
}

function iof() {
}

function repeat(n, f) {
    return function () {
        for (var i = 0; i < n; i++) {
            f();
        }
    }
}

function tests() {
    let ast = read("add x y")[0];
    console
}