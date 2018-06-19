//Source : https://stackoverflow.com/questions/27996544/how-to-correctly-curry-a-function-in-javascript
const curry = f => {
    const aux = (n, xs) =>
        n === 0 ? f(...xs) : x => aux(n - 1, [...xs, x])
    return aux(f.length, [])
}
function makeForeignFn(body, ...args) {
    return makeForeignFn1(new Function(args, body), args);
}

function makeForeignFn1(fn) {
    return new ZHATYPE.ZhaFn(fn);
}

function isNothing(val) {
    return val === undefined || val === null;
}
/**
 * Utilities
 */
const ZHATYPE = function () {
    return {
        ZhaNumber: function (noLiteral) {
            this.value = noLiteral;
            this.isNumber = function () {
                return true;
            }
            this.type = 1;
        },

        ZhaBoolean: function (bool) {
            this.value = bool;
            this.isTruthy = function () {
                return this.value === true;
            }
            this.isFalsey = function () {
                return this.value === false;
            }
            this.type = 0;
            this.toString = function () {
                return this.value;
            }
        },
        ZhaString: function (literal) {
            this.value = literal;
            this.type = 2;
            this.toString = function () {
                return this.value;
            }
        },
        ZhaFn: function (fn) {
            this.value = fn;
            this.invoke = function (env, args) {
                var returnVal = this.value.apply(undefined, args);
                return returnVal;
            };
            this.toString = function () {
                return "fn : " + this.value;
            }
        },
        ZhaList: function (array) {
            this.value = array !== undefined ? array : [];
            this.type = 4;
            this.toString = function () {
                return this.value;
            };
			this.conj = function(val){
				this.value.push(val);
			};
			this.first = function(val){
				return this.value[0];
			};
			this.second = function(val){
				return this.value[1];
			};
			this.third = function(val){
				return this.value[2];
			};
			this.nth = function(val, n){
				return this.value[n];
			};
			this.concat=function(zhaList){
				new ZhaList(this.value.concat(zhaList.value));
			};
			this.getList = function(){
				return this.value;
			};
			this.rest=function(){
				return new ZhaList(this.value.slice(1));
			}
        },

        ZhaSymbol: function (symStr) {
            this.value = symStr;
            this.type = 5;
        },

        isNumber: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaNumber;
        },
        isBool: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaBoolean;
        },
        isList: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaList;
        },
        isString: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaString;
        },
        isFn: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaFn;
        },
        isSymbol: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaSymbol;
        },
        isTyped: function (value) {
            return value instanceof this.ZhaBoolean || value instanceof this.ZhaFn ||
                value instanceof this.ZhaList || value instanceof this.ZhaNumber ||
                value instanceof this.ZhaString || value instanceof this.ZhaSymbol
        },
        isAtom: function (value) {
            return value instanceof this.ZhaBoolean || value instanceof this.ZhaNumber ||
                value instanceof this.ZhaString
        },
        typeIfy: function (literal) {
            if (literal === "true" || literal === '#T' || literal === true) {
                return new ZHATYPE.ZhaBoolean(true);
            } else if (literal === "false" || literal === '#F' || literal === false) {
                return new ZHATYPE.ZhaBoolean(false);
            } else if (!isNaN(parseFloat(literal))) {
                return new ZHATYPE.ZhaNumber(parseFloat(literal));
            } else if (literal.startsWith('"') && literal.endsWith('"')) {
                //Remove quotes
                return new ZHATYPE.ZhaString(literal.substring(1, literal.length - 1), 2);
            } else {
                return new ZHATYPE.ZhaSymbol(literal);
            }
        }
    }
}();



/**
 * Language runtime
 */
const RT = function () {
    return {
        add: makeForeignFn("return a + b;", "a", "b"),
        sub: makeForeignFn("return a - b;", "a", "b"),
        div: makeForeignFn("return a / b;", "a", "b"),
        mul: makeForeignFn("return a * b;", "a", "b"),
        iff: makeForeignFn1((pred, truthyPath) => {
            console.log(truthyPath);
            if (pred) {
                return ZHATYPE.isFn(truthyPath) ? truthyPath() : truthyPath;
            }
            return false;
        }, ["pred", "truthyPath"]),
        ">": makeForeignFn1((left, right) => left > right),
        "<": makeForeignFn1((left, right) => left < right),
        "+": makeForeignFn1((left, right) => left + right),
        "-": makeForeignFn1((left, right) => left - right),
        "=": makeForeignFn1((left, right) => left === right)
    }
}();
const ENVIRONMENT = function (runtime, root	) {
    this.bindings = {};
    this.root = root;

    for (prop in runtime) {
        var _key = prop;
        this.bindings[_key] = runtime[prop];
    };
	this.get = function(symbol){
		const rt = this.lookup(symbol);
		if(rt !== null && rt !== undefined){
			return rt.bindings[symbol];
		}
		throw new Error("Symbol "+symbol.value +" cannot be located.");
	}
    this.lookup = function (symbol) {
        if (this.bindings.hasOwnProperty(key)) {
            return this;
        } else if (root !== undefined) {
            return root.lookup(symbol);
        } else {
            console.error("Symbol " + symbol.value + " not found in ENV !");
            return undefined;
        }
    }
    this.define = function (sym, val) {
        //TODO: check if sym is a symbol
        this.bindings[sym] = val;
    }
};

const Eval = function(){
	
	this.eval = function(formsAsStr){
		//TODO:Read and eval
	};
	this.evalExp = function(form, env){
		
	};
	this.evalExpWithEnv = function(form, env){
		if(ZHATYPE.isList(form)){
			evalListWithEnv(form, env);
		}
		else if(ZHATYPE.isList(form)){
			const bounded = env.get(form);
			//TODO: Why need this check to return form as-is
			return bounded === null ? form: bounded;
		}
		else{
			return form;
		}
	};
	this.evalListWithEnv = function (ast, env){
		let firstSymbol = ast.first();
		if(ZHATYPE.isSymbol(first)){
			const keyWord = first.value;
			if(keyWord === "def"){
				const boundExpr = this.evalExpWithEnv(ast.third(), env);
				env.define(ast.second(), boundExpr);
				return boundExpr;
			}
			else if(keyWord === "let"){
				const bindings = ast.second();
				const letBody = ast.third();
				const letEnv = new ENVIRONMENT({}, env);
				for(var i=0;i<bindings.getList().length;i= i+2){
					const k = bindings.nth(i);
					const v = this.evalExpWithEnv(bindings.nth(i+1), letEnv);
					letEnv.define(k, v);
				}
				return this.evalExpWithEnv(letBody ,letEnv);
			}
			else if(keyWord === "if"){
				const cond = ast.second();
				const truthy = ast.third();
				const falsy = ast.nth(3);
				const cond_Result = this.evalExpWithEnv(cond, env);
				if(!cond_Result){
					return this.evalExpWithEnv(falsy, env);
				}
				return this.evalExpWithEnv(truthy,env);
			}
			else if(keyWord === "fn"){
				const fnArgs = ast.second();
				const fnBody =  ast.third();
				//const fnRT  = env;
				const e = this;
				return new ZHATYPE.ZhaFn((env, values) => {
					const closure = new ENVIRONMENT({}, env);
					for(var i=0;i<fnArgs.length;i++){
						closure.define(fnArgs.nth(i), values.nth(i));
					}
					return e.evalExpWithEnv(fnBody, closure);
				});
			}
			else{
				const dispatcher = env.get(first);
				if(ZHATYPE.isFn(dispatcher)){
					return dispatcher.invoke(env, this.expandExprs(ast.rest(),env));
				}else if (dispatcher != null){
					return dispatcher;
				}
			}
		}
		else if(ZHATYPE.isList(first)){
			let fn_res = evalListWithEnv(first, env);
			let flat_exp = new ZHATYPE.ZhaList();
			flat_exp.conj(fn_res);
			for(v in ast.rest().getList()){
				flat_exp.conj(v);
			}
			return evalListWithEnv(flat_exp, env);			
		}
		else{
			const fn = first;
			return fn.invoke(env, this.expandAttrs(ast.rest(),env));
		}
		throw new Error("Catch me !!");
	};
	this.expandAttrs = function(listForm, env){
		var evaled = [];
		for(var i=0;i<listForm.getList().length;i++){
			evaled.push(evalExp(listForm.nth(i), env));
		}
		return new ZHATYPE.ZhaList(evaled);
	}
}