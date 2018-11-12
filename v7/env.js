
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
    "+" : (a, b) => new Zha.Number(a.value + b.value),
    "-" : (a, b) => new Zha.Number(a.value - b.value),
    "*" : (a, b) => new Zha.Number(a.value * b.value),
    "inc": (a) => new Zha.Number(a.value+1),
    "list" : (...args) => new Zha.Vec(args),
    "conj" : (seq, val) => seq.conj(val),
    "hashmap" : (...nvp) => new Zha.HMap(nvp)
}

Zha.RT = new Zha.Env(bindings, undefined);