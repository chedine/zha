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
const evalIfTrue = R.curry((a, b, cond) => cond ? a : b);
const evalIfFalse = R.curry((a, b, cond) => cond ? b : a);
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
//TODO: Out of bounds checks
const first = (zhaList) => zhaList.first();
const last = (zhaList) => zhaList.nth(zhaList.size() -1);
const second = (zhaList) => zhaList.second();
const third = (zhaList) => zhaList.nth(2);
const nth = R.curry((zhaList, n) => zhaList.nth(n));
const lastButOne = (zhaList) => nth(zhaList,zhaList.size()-2);

/**
 * Fn applications
 */
const apply = R.curry((fn, ...v) => fn.invoke(new ZhaList(v)));
const rapply = R.curry((v, fn) => apply(fn, v));
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
	"third": third,
	"lastButOne": lastButOne,
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
	"false?": evalIfFalse,
	"apply": apply,
	"rapply": rapply,
	"list" : (...v) => {
		return new ZhaList(v);
	},
	"echo": (v) => v,
	"log": (...v) => {
		console.log(...v);
		//Return last element as the value of this expression
		return v[v.length-1];
	},
	"time/after": (timeunit, fn) => {
		return new Promise((resolve) => {
			setTimeout(() => resolve(fn.invoke(new ZhaList())), timeunit)
		});
	},
	"http/get": function (url, fn) {
		return new Promise((resolve) => {
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					//console.log(this.responseText);
					resolve(fn.invoke(new ZhaList([this.responseText])))
				}
			};
			xhttp.open("GET", url, true);
			xhttp.send();
		});
	}
}

const load_runtime = function () {
	return rt;
}