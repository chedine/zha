const ENVIRONMENT = function(runtime, root) {
    this.bindings = {};
    this.root = root;
    for (prop in runtime) {
        var _key = prop;
        this.bindings[_key] = runtime[prop];
    };
    this.lookup = function(symbol) {
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
    this.define = function(sym, val) {
        //TODO: check if sym is a symbol
        this.bindings[sym.value] = val;
    }
};
Zha.Env = ENVIRONMENT;

var global;
try {
    global = Function('return this')() || (42, eval)('this');
} catch (e) {
    global = window;
}

function getGlobal(sym) {
    const jsVar = sym;
    const nestedNs = jsVar.split(".");
    let resolved = global[nestedNs[0]];
    for (var i = 1; i < nestedNs.length; i++) {
        resolved = resolved[nestedNs[i]]
    }
    return resolved;
};

const bindings = {
    "+": (a, b) => a.add(b),
    "-": (a, b) => a.sub(b),
    "*": (a, b) => a.mul(b),
    "/": (a, b) => a.div(b),
    "%": (a, b) => a.mod(b),
    "^": (a, b) => a.pow(b),
    "&&": (a, b) => a.and(b),
    "||": (a, b) => a.or(b),
    ">": (a, b) => a.gt(b),
    ">=": (a, b) => a.gtEq(b),
    "<=": (a, b) => a.ltEq(b),
    "<": (a, b) => a.lt(b),
    "eq": (a, b) => a.eq(b),
    "!": (a) => a.not(),
    "inc": (a) => a.inc(),
    "dec": (a) => a.dec(),
    "list": (...args) => [].concat(args),
    "conj": (seq, val) => seq.conj(val),
    "hashmap": (...nvp) => new Zha.HMap(nvp),
    "toJs": (zha) => zha.toNative(),
    "apply": new Zha.Fn((args, env) => {
        const fn = args[0];
        const argArray = args[1].value;
        //  const args1 = Array.isArray(argArray) ? argArray : [argArray];
        return fn.invoke(argArray);
    }),
    "js/g": (sym) => {
        return getGlobal(sym);
    },
    "jp!": (...listForm) => {
        //JS property access (includes nested props)
        const obj = listForm.get(0);
        const props = listForm.slice(1);
        let resolved = obj[props[0].value];
        for (var i = 1; i < props.length; i++) {
            resolved = resolved[props[i].value];
        }
        return resolved;
    },
    "jpset!": (...listForm) => {
        const obj = listForm.get(0);
        const props = listForm.slice(1, listForm.length - 1);
        let resolved = obj;
        let prop = props[0];

        for (var i = 1; i < props.length; i++) {
            resolved = resolved[prop.value];
            prop = props[i];
        }
        obj[prop.value] = listForm.last();
        return obj;
    },
    "new": (typeInfo, ...args) => {
        const cls = getGlobal(typeInfo);
        return new(Function.prototype.bind.apply(cls, [null].concat(args)));
    },
    /**  "js/call": (obj, methodName, ...args) => {
          const jsCompatibleArgs = [];
          for (var i = 0; i < args.length; i++) {
              if (Zha.ts.isZhaType(args[i])) {
                  jsCompatibleArgs.push(args[i].toNative());
              } else {
                  jsCompatibleArgs.push(args[i]);
              }
          }
          return obj[methodName.value].apply(obj, jsCompatibleArgs);
      },**/
    "jc!": (jsmethod, ...args) => {
        const callable = getGlobal(jsmethod);
        return callable.apply(null, args);
    },
    "js/prop": (obj, prop) => obj[prop.value],
    "js/prop!": (obj, prop, val) => { obj[prop] = val; return obj },
    "js/eval": (str) => (eval(str)),
    "h/doc": () => document,
    "h/win": () => window
}

Zha.RT = new Zha.Env(bindings, undefined);