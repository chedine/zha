//const R = require("ramda")
/* 
Basic Arith - Lib
*/
const add = R.curry((a, b) => a + b);
const mul = R.curry((a, b) => a * b);
const sub = R.curry((a, b) => a - b);
const div = R.curry((a, b) => a / b);
const pow = R.curry((a, b) => a ^ b);
const mod = R.curry((a, b) => a % b);
/* 
Basic Logic - Lib
*/
const or = R.curry((a, b) => a || b);
const and = R.curry((a, b) => a && b);
const gt = R.curry((a, b) => a > b);
const lt = R.curry((a, b) => a < b);
const gte = R.curry((a, b) => a >= b);
const lte = R.curry((a, b) => a <= b);
const eq = R.curry((a, b) => a == b);
const notEq = R.curry((a, b) => a != b);
const evalIfTrue = R.curry((a,b,cond) => cond? a: b);
const evalIfFalse = R.curry((a,b,cond) => cond? b: a);
/* 
Basic String - Lib
*/
const length = R.curry((a) => a.length);
const toUpper = R.curry((a) => a.toUpperCase());
const toLower = R.curry((a) => a.toLowerCase());
const charAt = R.curry((pos, str) => str.charAt(pos - 1));
const substr = R.curry((start, str) => str.substring(start));
const firstFew = R.curry((noOfChars, str) => str.substring(0, noOfChars));
/* 
List - Lib
*/
const first = R.curry((list) => list[0]);
const last = R.curry((list) => list[list.length - 1]);
const second = R.curry((list) => list[1]);
const nth = R.curry((n, list) => list[n - 1]);
const lastButOne = R.curry((list) => list.length >= 2 ? list[list.length - 2] : list[0]);

/**
 * Fn applications
 */
const apply = R.curry((fn, v) => fn(v));
const rapply = R.curry((v, fn) => apply(fn,v));
/* 
Library
*/
const rt = {
	"char@": charAt,
	"toUpper": toUpper,
	"substr": substr,
	"toLower": toLower,
	"first": first,
	"second": second,
	"last": last,
	"nth": nth,
	"add": add,
	"mul": mul,
	"sub": sub,
	"div": div,
	"pow": pow,
	"mod": mod,
	"length": length,
	"firstFew": firstFew,
	"or": or,
	"and": and,
	"eq": eq,
	"not": notEq,
	"lt": lt,
	"gt": gt,
	"true?": evalIfTrue,
	"false?" : evalIfFalse,
	"apply": apply,
	"rapply" : rapply,
	"echo" : (v) => v,
	"log" : (v) => {console.log(v); return v;}
}

const load_runtime = function () {
	return rt;
}