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
                var returnVal = this.value.call(this, env, args);
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
			this.nth = function(n){
				return this.value[n];
			};
			this.concat=function(zhaList){
				new ZhaList(this.value.concat(zhaList.value));
			};
			this.getList = function(){
				return this.value;
			};
			this.rest=function(){
				return new ZHATYPE.ZhaList(this.value.slice(1));
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
        ">": makeForeignFn1((env, args) => new ZHATYPE.ZhaBoolean(args.first().value < args.second().value)),
        "<": makeForeignFn1((env, args) => new ZHATYPE.ZhaBoolean(args.first().value > args.second().value)),
        "+": makeForeignFn1((env, args) => new ZHATYPE.ZhaNumber(args.first().value + args.second().value)),
        "-": makeForeignFn1((env, args) => new ZHATYPE.ZhaNumber(args.first().value - args.second().value)),
        "/": makeForeignFn1((env, args) => new ZHATYPE.ZhaNumber(args.first().value / args.second().value)),
        "*": makeForeignFn1((env, args) => new ZHATYPE.ZhaNumber(args.first().value * args.second().value)),
        "eq?": makeForeignFn1((env, args) => new ZHATYPE.ZhaBoolean(args.first().value === args.second().value))
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
			return rt.bindings[symbol.value];
		}
		throw new Error("Symbol "+symbol.value +" cannot be located.");
	}
    this.lookup = function (symbol) {
        if (this.bindings.hasOwnProperty(symbol.value)) {
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
        this.bindings[sym.value] = val;
    }
};

const Eval = function(){
	
	this.eval = function(formsAsStr){
		//TODO:Read and eval
	};
	this.evalExp = function(form, env){
		return this.evalExpWithEnv(form, env);
	};
	this.evalExpWithEnv = function(form, env){
		if(ZHATYPE.isList(form)){
			return this.evalListWithEnv(form, env);
		}
		else if(ZHATYPE.isSymbol(form)){
			const bounded = env.get(form);
			//TODO: Why need this check to return form as-is
			return bounded === null ? form: bounded;
		}
		else{
			return form;
		}
	};
	this.evalListWithEnv = function (ast, env){
		let first = ast.first();
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
					for(var i=0;i<fnArgs.value.length;i++){
						closure.define(fnArgs.nth(i), values.nth(i));
					}
					return e.evalExpWithEnv(fnBody, closure);
				});
			}
			else{
				const dispatcher = env.get(first);
				if(ZHATYPE.isFn(dispatcher)){
					return dispatcher.invoke(env, this.expandAttrs(ast.rest(),env));
				}else if (dispatcher != null){
					return dispatcher;
				}
			}
		}
		else if(ZHATYPE.isList(first)){
			let fn_res = this.evalListWithEnv(first, env);
			let flat_exp = new ZHATYPE.ZhaList();
			flat_exp.conj(fn_res);
			for(v in ast.rest().getList()){
				flat_exp.conj(v);
			}
			return this.evalListWithEnv(flat_exp, env);			
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
			evaled.push(this.evalExp(listForm.nth(i), env));
		}
		return new ZHATYPE.ZhaList(evaled);
	}
}

const Reader = function(){
    const READ_TABLE = {
        "`": this.readQuasiQuote
    };
    
    this.read = function (program) {
        const ast = readExpr(program, 0, new typeSystem.ZhaList([]));
        return ast;
    };
    this.readMacro = function (token, program, currentPos, astSoFar){
        READ_TABLE[token](program,currentPos, astSoFar);
    };
    
    readQuasiQuote = function(program, currentPos, astSoFar){
        var form = (readExpr(program, currentPos + 1, new ZhaList([])));
        var listForm = form.first();
        var intercepted = [new Symbol("list")].concat(listForm.value);
        astSoFar.push(new ZhaList(intercepted));
    }
    
    function isReaderMacro(token){
        return READ_TABLE[token] !== undefined;
    }
    
    function readExpr(program, startPos, ast) {
        //const ast = baseAST;
        let buf = '';
        let readingQuotes = false;
        i = startPos;
    
        const addToAST = (token) => {
            if (token.length > 0) {
                ast.conj(typeSystem.typeIfy(token));
            }
        }
        for (i = startPos; i < program.trim().length; i++) {
            const char = program.charAt(i);
            if(isReaderMacro(char)){
                readMacro(char, program, i , ast);
            //	console.log("resuming from "+ i , ast.toString());
                i = i-1;
                continue;
            }
            if (char === '"') {
                if (buf.length > 0) {
                    if (readingQuotes) {
                        buf = buf + '"';
                        addToAST(buf);
                        buf = '';
                        readingQuotes = false;
                    } else {
                        console.log(`Error encountered quotes @ pos ${i} in ${program}`);
                    }
                } else {
                    readingQuotes = true;
                    buf = buf + '"';
                }
            } else if (char === ' ') {
                if (!readingQuotes) {
                    if (buf.trim().length > 0) {
                        addToAST(buf);
                        buf = '';
                    }
                } else {
                    buf = buf + char;
                }
            } else if (char === '(') {
                ast.conj(readExpr(program, i + 1, new typeSystem.ZhaList([])));
            } else if (char === ')') {
                addToAST(buf);
                buf = '';
                return ast;
            } else if (!readingQuotes &&
                char === '\r' || char === '\n' || char === '\r\n') {
                addToAST(buf);
                //addToAST("\n");
                buf = '';
            } else if (char === '\t') {
                addToAST(buf);
                buf = '';
            } else {
                buf += char;
            }
        }
        if (buf.trim().length > 0) {
            addToAST(buf);
        }
        return ast;
    }
    
    function isMacroCall(ast, env) {
        if(!isList(ast) || !isSymbol(ast.first())){
            return false;
        }
        var present = env.isPresent(ast.first().value);
        return present && env.lookup(ast.first().value).isMacro;
    }
    
    function macroExpand(ast, env){
        if(!isMacroCall(ast, env)){
            return ast;
        }
        var macroExpander = env.lookup(ast.first().value);
        var expandedForm = macroExpander.invoke(ast.rest());
        console.log("Expanded as ", expandedForm);
        return expandedForm;
    }
}

const reader = new Reader();
const evaler = new Eval();
const typeSystem = ZHATYPE;
const rootEnv = new ENVIRONMENT(RT, undefined);

const run = function(program){
    var asts = reader.read(program);
    for(var i=0; i<asts.getList().length;i++){
//        console.log(asts.nth(i));
        return evaler.evalExp(asts.nth(i), rootEnv);
    }
    
}

