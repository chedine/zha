//RT
const RT = function () {
    return {
        "<": (a, b) => new _Zha$.ZhaBoolean(a.value < b.value),
        "<=": (a, b) => new _Zha$.ZhaBoolean(a.value <= b.value),
        ">": (a, b) => new _Zha$.ZhaBoolean(a.value > b.value),
        "eq": (a, b) => new _Zha$.ZhaBoolean(a.value === b.value),
        "list": new _Zha$.ZhaFn((args, env) => {
            return new _Zha$.ZhaVec(args);
        }),
        "range": new _Zha$.ZhaFn((args, env) => {
            var start = args[0].value;
            var length = args[1].value;
            // var step = args[2].value;
            return new _Zha$.ZhaVec(Array.from({ length: length }, (x, i) => new _Zha$.ZhaNumber(i + start)));
        }),
        "vec": new _Zha$.ZhaFn((args, env) => {
            return new _Zha$.ZhaVec(args);
        }),
        "hmap": new _Zha$.ZhaFn((args, env) => {
            return new _Zha$.ZhaMap(args);
        }),
        "->Str" :new _Zha$.ZhaFn((args, env) => {
            return new _Zha$.ZhaString(args[0]);
        }), 
        "call": new _Zha$.ZhaFn((args, env) => args[0].invoke(args.slice(1), env)),
        "curry": new _Zha$.ZhaFn((args, env) => {
            const srcFunc = args[0];
          //  console.log("curried env ", env.print());
            return new _Zha$.ZhaFn(srcFunc.value, srcFunc._meta.name, srcFunc._meta.args,env, true);
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
            return new _Zha$.ZhaFn(getPiped(args), "_piped", args[0]._meta.args, env, false);
        }),
        //async tests
        "timer": new _Zha$.ZhaFn((f, env) => {
            const fn = () => {
                if (_Zha$.isFn(f[0])) {
                    f[0].invoke([], env);
                } else {
                    f[0].apply(undefined, []);
                }
                return new _Zha$.ZhaKeyword(":done");
            }
            setTimeout(fn, f[1].value);
        }),
        //Js Interop
        /**
         * All unsafe ops. Deal with it
         * TODO: Clean 'em up
         */
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
        "js/eval": (str) => (eval(str)),
        "log": new _Zha$.ZhaFn((args, env) => console.log(args[0])),
        "fetch": new _Zha$.ZhaFn((args, env) => {
            const url = args[0].value;
            const handler = args[1];
            return fetch(url, { method: 'get' }).then((d) => handler.invoke([d], env));
        }),
        "fetch1": new _Zha$.ZhaAsyncFn((args, env) => {
            const url = args[0].value;
            //const handlerArray = args[1];
            let promise = fetch(url, { method: 'get' });
            /**for (var i = 0; i < handlerArray.length; i++) {
                var operation = handlerArray[i];
                promise.then((d) => {
                    if (_Zha$.isFn(operation)) {
                        return operation.invoke([d], env);
                    }
                    var resolvedOP = env.lookup(operation);
                    if (_Zha$.isFn(resolvedOP)) {
                        return resolvedOP.invoke([d], env);
                    }
                });
            }**/
            return promise;
        }),
        "fetch/text" : new _Zha$.ZhaAsyncFn((args,env) => {
            const r =  args[0].text();
            console.log(r);
            return r;
        }),
        "apply" : new _Zha$.ZhaFn((args, env) => {
            const fn = args[0];
            const argArray = _Zha$.isSeq(args[1]) ? args[1].value: args[1];
            const args1 = Array.isArray(argArray) ? argArray : [argArray];
            return fn.invoke([...args1]);
        })
       // "echo": new _Zha$.ZhaFn((args, env) => args[0])
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
    this.print = function(){
        var obj = {cur: this.bindings, root : this.root !== undefined ? this.root.print() : {}};
        return JSON.stringify(obj);
    }
};
const ENV = new ENVIRONMENT(RT, undefined);

class Test {
    constructor(v, v1) {
        this.v = v;
        this.v1 = v1;
    }
    sayHi() {
        console.log("Hi");
    }
    sum(n, n1) {
        return n + n1;
    }
    print() {
        return this.v + this.v1;
    }
}   