//RT
const RT = function () {
    return {
        "+": (a, b) => new _Zha$.ZhaNumber(a.value + b.value),
        "-": (a, b) => new _Zha$.ZhaNumber(a.value - b.value),
        "*": (a, b) => new _Zha$.ZhaNumber(a.value * b.value),
        "/": (a, b) => new _Zha$.ZhaNumber(a.value / b.value),
        "<": (a, b) => new _Zha$.ZhaBoolean(a.value < b.value),
        "<=": (a, b) => new _Zha$.ZhaBoolean(a.value <= b.value),
        ">": (a, b) => new _Zha$.ZhaBoolean(a.value > b.value),
        "eq": (a, b) => new _Zha$.ZhaBoolean(a.value === b.value),
        "toUpper": (str) => new _Zha$.ZhaString(str.value.toUpperCase()),
        "toLower": (str) => new _Zha$.ZhaString(str.value.toLowerCase()),
        "substr": (str, from) => new _Zha$.ZhaString(str.value.substr(from.value)),
        "list": function (...rest) {
            return new _Zha$.ZhaList(rest);
        },
        "vec": function (...rest) {
            return new _Zha$.ZhaVec(rest);
        },
        "conj": (seq, el) => seq.conj(el),
        "get": (seq, index) => seq.get(index),
        "nth": (seq, n) => seq.nth(n),
        "count": new _Zha$.ZhaFn((seq) => seq[0].count()),
        "last": new _Zha$.ZhaFn((seq) => seq[0].last()),
        "call": new _Zha$.ZhaFn((args, env) => args[0].invoke(args.slice(1), env)),
        "curry": new _Zha$.ZhaFn((args, env) => {
            const srcFunc = args[0];
            return new _Zha$.ZhaFn(srcFunc.value, srcFunc._meta.name, srcFunc._meta.args, true);
        }),
        "|>": new _Zha$.ZhaFn((args, env) => {
            const getPiped = (fnList) => {
                return (_args, _env) => {
                    let result = fnList[0].invoke(_args, _env);
                    for (var i = 1; i < fnList.length; i++) {
                        result = fnList[i].invoke([result], _env);
                    }
                    return result;
                }
            };
            //TODO: To determine if it needs to be curried.
            return new _Zha$.ZhaFn(getPiped(args), "_piped", args[0]._meta.args, false);
        }),
        
        //Js Interop
        "toJs" : (zha) => _Zha$.isLiteral(zha) ? zha.value : mori.toJs(zha.value),
    }
}();
//ENV

const ENVIRONMENT = function (runtime, root) {
    this.bindings = {};
    this.root = root;
    for (prop in runtime) {
        var _key = prop;
        this.bindings[_key] = runtime[prop];
    };
    this.lookup = function (symbol) {
        var key = _Zha$.isSymbol(symbol) ? symbol.value : symbol;
        if (this.bindings.hasOwnProperty(key)) {
            return this.bindings[key];
        } else if (root !== undefined) {
            return root.lookup(symbol);
        } else {
            console.error("Symbol " + symbol.value + " not found in ENV !");
            return undefined;
        }
    }
    this.isDefined = function (symbol) {
        var key = _Zha$.isSymbol(symbol) ? symbol.value : symbol;
        if (this.bindings.hasOwnProperty(key)) {
            return true;
        }
        if (root !== undefined) {
            return root.isDefined(symbol);
        }
        return false;
    }
    this.toString = function () {
        var notation = {};
        for (prop in this.bindings) {
            notation[prop] = isNothing(this.bindings[prop]) ? null : this.bindings[prop].toString();
        }
        return JSON.stringify(notation);
    }
    this.define = function (sym, val) {
        //TODO: check if sym is a symbol
        this.bindings[sym.value] = val;
    }
};
const ENV = new ENVIRONMENT(RT, undefined);