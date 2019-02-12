'use strict';
var global;

    try {
        global = Function('return this')() || (42, eval)('this');
    } catch (e) {
        global = window;
    }

function Eval(_zha) {    
    const SPL_OPS = {
        "fn": true,
        "#": true,
        "def": true,
        "if": true,
        "loop": true,
        "~": true,
        "return": true
    }
    const SPL_SYM = {
        "stateVar": new _zha.Symbol("$state"),
        "idVar": new _zha.Symbol("$idx"),
        "valVar": new _zha.Symbol("$val")
    }
    /**
     * Public API to eval an expression.
     * @param {} srcAST 
     */
    this.eval = function (srcAST, runtime) {
        return evalAST(srcAST, runtime || Zha.RT);
    }


    function evalAST(ast, env) {
        if (Zha.ts.isList(ast)) {
            return evalList(ast, env);
        } else if (Zha.ts.isBlock(ast)) {
            return evalBlock(ast, env);
        } else if (Zha.ts.isSymbol(ast)) {
            return env.lookup(ast);
        } else {
            return ast;
        }
    }

    function evalList(listForm, env) {
        const head = listForm.get(0);
        if (SPL_OPS[head.value]) {
            return evalSplOps(listForm, env);
        } else {
            const fn = evalAST(head, env);
            const fnArgsAsExprs = listForm.rest();
            const fnArgs = expandOperands(fnArgsAsExprs, env);
            return invoke(fn, fnArgs);
        }
    }

    function evalBlock(vecForm, env) {
        const returnForm = vecForm.last();
        const steps = vecForm.value.slice(0, vecForm.value.length - 1);
        const letEnv = new Zha.Env({}, env);
        for (var i = 0; i < steps.length; i++) {
            evalAST(steps[i], letEnv);
        }
        return evalAST(returnForm, letEnv);
    }

    function evalSplOps(listForm, env) {
        const head = listForm.get(0);
        if (head.value === "def") {
            const symbol = listForm.get(1);
            env.define(symbol, evalAST(listForm.get(2), env));
            return symbol;
        } else if (head.value === "fn") {
            const params = listForm.get(1);
            const fnBody = listForm.get(2);
            return new Zha.Fn((args) => {
                const fnEnv = new Zha.Env({}, env);
                for (var i = 0; i < args.length; i++) {
                    fnEnv.define(params.get(i), args[i]);
                }
                return evalAST(fnBody, fnEnv);
            });
        } else if (head.value === "if") {
            const cond = listForm.get(1);
            const condResult = evalAST(cond, env);
            if (condResult === true) {
                return evalAST(listForm.get(2), env);
            }
            return listForm.length > 3 ?
                evalAST(listForm.get(3), env) :
                Zha.ts.Nil;
        } else if (head.value === "loop") {
            const iterable = evalAST(listForm.get(1), env);
            //  const loopingOpts = listForm.count().value > 3 ? listForm.get(2) : {};
            //  const loopBody = listForm.count().value > 3 ? listForm.get(3) : listForm.get(2);
            const loopBody = listForm.get(2);
            const start = 0;
            const end = iterable.length;
            const incrementor = 1;
            const loopEnv = new Zha.Env({}, env);
            var state = listForm.length > 3 ? evalAST(listForm.get(3), env) : new Array(); // mutable reference
            for (var i = start; i < end; i = i + incrementor) {
                loopEnv.define(SPL_SYM.stateVar, state);
                loopEnv.define(SPL_SYM.idVar, new Number(i));
                loopEnv.define(SPL_SYM.valVar, iterable.get(i));
                state = evalAST(loopBody, loopEnv);
                if (Zha.ts.isReturn(state)) {
                    return state.hasValue() ? state : Zha.ts.Nil; // used to break out of the loop. TODO: Anything better ?
                }
            }
            return state;
        } else if (head.value === "~") {
            return listForm.get(1); // listForm.rest();
        } else if (head.value === "return") {
            const returnVal = listForm.length > 1 ? evalAST(listForm.get(1), env) : undefined;
            return new Zha.ZhaReturn(returnVal);
        }
        /** else if(head.value ===  "#") {
             const rest = listForm.rest();
             return evalDirective(rest, env);
         }**/
    }

    function evalDirective(listForm, env) {
        //In case of components, the current syntax is 
        //[# [hashmap other-args]]
        if (Zha.ts.isList(listForm.first()) && listForm.first().first().value === "hashmap") {
            const nvps = [];
            const nvpList = listForm.first().rest();
            for (var i = 0; i < nvpList.value.length; i++) {
                nvps.push((nvpList.get(i)));
            }
            return new Zha.Component(nvps);
        }
        throw new Error("Unsupported directive " + listForm.get(0).value);
    }

    function expandOperands(operandsList, env) {
        const expandedOperands = new Array();
        for (var i = 0; i < operandsList.length; i++) {
            expandedOperands.push(evalAST(operandsList.get(i), env));
        }
        return (expandedOperands);
    }

    function invoke(fnLike, args) {
        if (Zha.ts.isFn(fnLike)) {
            return fnLike.invoke(args);
        } else if (Zha.ts.isKeyword(fnLike)) {
            const target = args.first();
            return fnLike.invoke(target);
        } else {
            //Assuming its a native fn call
            return fnLike.apply(undefined, args);
        }
    }
}