'use strict';
var global;

try {
    global = Function('return this')() || (42, eval)('this');
} catch (e) {
    global = window;
}

function ZhaCompiler(_zha) {

    this.compile = function(srcAST, runtime) {
        return compileFn(srcAST, runtime || Zha.RT);
    }

    function compileFn(srcAst, runtime) {
        const fnName = srcAst[1].value;
        const fnDefn = srcAst[2];
        const fnParams = fnDefn[1]
        const fnBody = fnDefn[2];
        
		const compiledBody = new FunctionAp(fnBody[0], fnBody.slice(1));

        const compiled = (...args) => {
            const fnEnv = new Zha.Env({}, runtime);
            for (var i = 0; i < args.length; i++) {
                fnEnv.define(fnParams.get(i), args[i]);
            }
            //return exeAST(fnBody, fnEnv);
			return compiledBody.apply(fnEnv);
        }
        return compiled;
    }

    function exeAST(fnBody, runtime) {
        if (Zha.ts.isList(fnBody)) {
            return applyFunction(fnBody, runtime);
        } else if (Zha.ts.isBlock(fnBody)) {
            const returnForm = fnBody.last();
            const steps = vecForm.value.slice(0, fnBody.value.length - 1);
            const letEnv = new Zha.Env({}, runtime);
            for (var i = 0; i < steps.length; i++) {
                evalAST(steps[i], letEnv);
            }
            return evalAST(returnForm, letEnv);
        }
    }

    function applyFunction(ast, runtime) {
        const f = runtime.lookup(ast[0]);
        const args = [];
        for (var i = 1; i < ast.length; i++) {
            let v;
            if (Zha.ts.isSymbol(ast[i])) {
                v = runtime.lookup(ast[i])
            } else {
                v = ast[i];
            }
            args.push(v);
        }
        if (Zha.ts.isFn(f)) {
            return f.invoke(args);
        } else {
            return f.apply(undefined, args);
        }
    }
	
	function FunctionAp(f, args){
		this.fn = f;
		this.args = args;
		this.apply = function(runtime){
			const argv = [];
			const f = runtime.lookup(this.fn);
			for (var i = 0; i < this.args.length; i++) {
				let v;
				if (Zha.ts.isSymbol(this.args[i])) {
					v = runtime.lookup(this.args[i])
				} else {
					v = this.args[i];
				}
				argv.push(v);
			}
			if (Zha.ts.isFn(f)) {
				return f.invoke(argv);
			} else {
				return f.apply(undefined, argv);
			}
		}
	}
}