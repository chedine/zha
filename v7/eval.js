var ZEVAL = ZEVAL || {};
; (function (_eval, undefined) {

    const SPL_OPS = {
        "fn": true, "#": true, "def": true, "if": true, "loop":true
    }

    _eval.eval = function (srcAST) {
        return evalAST(srcAST, Zha.RT);
    }

    const evalAST = function (ast, env) {
        if (Zha.ts.isList(ast)) {
            return evalList(ast, env);
        }
        else if (Zha.ts.isVec(ast)) {
            return evalVec(ast, env);
        }
        else if (Zha.ts.isSymbol(ast)) {
            return env.lookup(ast);
        }
        else {
            return ast;
        }
    }

    function evalList(listForm, env) {
        const head = listForm.get(0);
        if (SPL_OPS[head.value]) {
            return evalSplOps(listForm, env);
        }
        else {
            const fn = evalAST(head, env);
            const fnArgsAsExprs = listForm.rest();
            const fnArgs = expandOperands(fnArgsAsExprs, env);
            return invoke(fn, fnArgs);
        }
    }
    function evalVec(vecForm, env) {
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
            return env.define(listForm.get(1), evalAST(listForm.get(2), env));
        }
        else if (head.value === "fn") {
            const params = listForm.get(1);
            const fnBody = listForm.get(2);
            return new Zha.Fn((args) => {
                const fnEnv = new Zha.Env({}, env);
                for (var i = 0; i < args.length; i++) {
                    fnEnv.define(params.get(i), args[i]);
                }
                return evalAST(fnBody, fnEnv);
            });
        }
        else if (head.value === "if") {
            const cond = listForm.get(1);
            const condResult = evalAST(cond, env);
            if (condResult.value) {
                return evalAST(listForm.get(2), env);
            }
            return listForm.count().value > 3 ?
                evalAST(listForm.get(3), env)
                : Zha.ts.Nil;
        }
        else if (head.value === "loop") {
            const iterable = evalAST(listForm.get(1), env);
            const loopingOpts = listForm.count().value > 3 ? listForm.get(2) : {};
            const loopBody = listForm.count().value > 3 ? listForm.get(3) : listForm.get(2);
            const start = 0;
            const end = iterable.count().value;
            const incrementor = 1;
            const loopEnv = new Zha.Env({}, env);
            const stateSym = new Zha.Symbol("$state");
            const idxSym = new Zha.Symbol("$idx");
            const valSym = new Zha.Symbol("$val");
            var state = new Zha.Vec();
            for(var i = start;i<end;i=i+incrementor){
                loopEnv.define(stateSym, state);
                loopEnv.define(idxSym, new Zha.Number(i));
                loopEnv.define(valSym, iterable.get(i));
                state = evalAST(loopBody, loopEnv);
            }
            return state;
        }
    }
    function expandOperands(operandsList, env) {
        const expandedOperands = [];
        for (var i = 0; i < operandsList.value.length; i++) {
            expandedOperands.push(evalAST(operandsList.get(i), env));
        }
        return new Zha.List(expandedOperands);
    }
    function invoke(fnLike, args) {
        if (Zha.ts.isFn(fnLike)) {
            return fnLike.invoke(args.value);
        }
        else {
            //Assuming its a native fn call
            return fnLike.apply(undefined, args.value);
        }
    }
})(ZEVAL);
Zha.Eval = ZEVAL;