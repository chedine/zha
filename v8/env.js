
const ENVIRONMENT = function (runtime, root) {
    this.bindings = {};
    this.root = root;
    for (prop in runtime) {
        var _key = prop;
        this.bindings[_key] = runtime[prop];
    };
    this.lookup = function (symbol) {
        var key = Zha.ts.isSymbol(symbol) ? symbol.value : symbol;
        if (this.bindings.hasOwnProperty(key)) {
            return this.bindings[key];
        } else if (this.root !== undefined) {
            return this.root.lookup(symbol);
        } else {
            console.error("Symbol " + symbol.value + " not found in ENV !");
            return undefined;
        }
    }
    this.define = function (sym, val) {
        //TODO: check if sym is a symbol
        this.bindings[sym.value] = val;
    }
};
Zha.Env = ENVIRONMENT;
const bindings = {
    "+" : (a, b) => a.add(b),
    "-" : (a, b) => a.sub(b),
    "*" : (a, b) => a.mul(b),
	"/" : (a, b) => a.div(b),
	"%" : (a, b) => a.mod(b),
	"^" : (a, b) => a.pow(b),
	"&&" : (a, b) => a.and(b),
	"||" : (a, b) => a.or(b),
	">" : (a, b) => a.gt(b),
	">=" : (a, b) => a.gtEq(b),
	"<=" : (a, b) => a.ltEq(b),
	"<" : (a, b) => a.lt(b),
	"eq" : (a, b) => a.eq(b),
	"!" : (a) => a.not(),
    "inc": (a) => a.inc(),
	"dec": (a) => a.dec(),
    "list" : (...args) => new Zha.Vec(args),
	"vec" : (...args) => new Zha.Vec(args),
    "conj" : (seq, val) => seq.conj(val),
    "hashmap" : (...nvp) => new Zha.HMap(nvp),
	"toJs": (zha) => zha.toNative(),
    "js/new": (type, ...args) => {
        let str = `new ${type.value}`;
            if (args) {
                str += " (";
                var stopper = args.length - 1;
                for (var i = 0; i < args.length; i++) {
                    str += args[i].toString();
                    if (i < stopper) {
                        str += " , "
                    }
                }
                str += " );";
            }
            return (eval(str));
    },
    "js/call": (obj, methodName, ...args) => obj[methodName.value].apply(obj, args),
    "js/prop": (obj, prop) => obj[prop.value],
    "js/prop!": (obj, prop, val) => { obj[prop] = val; return obj },
    "js/eval": (str) => (eval(str))
}

Zha.RT = new Zha.Env(bindings, undefined);