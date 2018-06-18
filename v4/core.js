//Source : https://stackoverflow.com/questions/27996544/how-to-correctly-curry-a-function-in-javascript
const curry = f => {
    const aux = (n, xs) =>
        n === 0 ? f(...xs) : x => aux(n - 1, [...xs, x])
    return aux(f.length, [])
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
            this.invoke = function (args) {
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
const ENVIRONMENT = function (runtime, root) {
    this.bindings = {};
    this.root = root;
    for (prop in runtime) {
        var _key = prop;
        this.bindings[_key] = runtime[prop];
    };
    this.lookup = function (symbol) {
        var key = ZHATYPE.isSymbol(symbol) ? symbol.value : symbol;
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
        var key = ZHATYPE.isSymbol(symbol) ? symbol.value : symbol;
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
/**
 * Interpreter
 */
function addToExpr(parentExpr, expr) {
    for (var i = 0; i < expr.length; i++) {
        var c = expr[i];
        if (Array.isArray(c)) {
            parentExpr.expr.push(new EXPR(c));
        } else {
            parentExpr.expr.push(c);
        }
    }
}

function cloneExpr(blueprint, args) {
    var expr = new EXPR([]);
    expr.expr = blueprint.expr.slice();
    expr.env = Object.assign({}, blueprint.env);
    expr.params = blueprint.params.slice();
    expr.name = blueprint.name;
    expr.fn = blueprint.fn;
    expr.paramFilled = blueprint.paramFilled + args.length;
    var methodScope = expr.env;
    for (i = 0; i < args.length; i++) {
        methodScope[expr.params[i].value] = args[i];
    }
    expr.env = methodScope;
    return expr;
}

function EXPR(list) {
    this.expr = [];
    this.env = {};
    this.params = [];
    this.name = undefined;
    this.def = false;
    this.fn = false;
    this.paramFilled = 0;
    var i = 0,
        j = 0;
    var where = 0,
        asgnmnt = 0;
    for (; i < list.length; i++) {
        if (ZHATYPE.isSymbol(list[i]) && list[i].value === 'where') {
            where = i;
            break;
        }
    }
    for (; j <= i; j++) {
        if (ZHATYPE.isSymbol(list[j]) && list[j].value === '=') {
            asgnmnt = j;
            break;
        }
    }
    if (asgnmnt > 0) {
        this.name = list[0];
        this.params = list.slice(1, j);
        this.def = true;
        this.fn = this.params.length > 0; // what about 0 arg fns?
        //this.expr = list.slice(j+1, i);
        addToExpr(this, list.slice(j + 1, i));
    } else {
        //this.expr = list.slice(0, i);
        addToExpr(this, list.slice(0, i));
    }
    /**for (i = i + 1; i < list.length; i++) {
        this.env[list[i][0].value] = new EXPR(list[i]);
    };**/
    if(i < list.length){
        //Meaning there is a where clause. Which is a list
        //Break it down by comma
        let whereBinding = list[i+1];
        //TODO: Not an efficient way.. works for the prototyping
        let declStart = 0;
        for(k=0;k<whereBinding.length;k++){
            if(whereBinding[k].value === ','){
                const binding = whereBinding.slice(declStart,k);
                this.env[binding[0].value] = new EXPR(binding);
                declStart = k+1;
            }
        }
        if(declStart < whereBinding.length){
            //leftover
            const binding = whereBinding.slice(declStart,whereBinding.length);
            this.env[binding[0].value] = new EXPR(binding);
        }
    }
    this.isLiteral = function () {
        return this.expr.length === 1;
    };
    this.isSplForm = function () {
        var token = this.expr[0];
        if (ZHATYPE.isSymbol(token)) {
            return (token.value === "if");
        }
        return false;
    }
}

function isExpression(expr) {
    return expr instanceof EXPR;
}

function tokenize(token) {
    return ZHATYPE.typeIfy(token);
}

function read(program) {
    const ast = [];
    read1(program, ast, 0);
    return ast;
}

function read1(program, collector, pos) {
    const addToken = token => {
        if (token.trim().length === 0) {
            return;
        }
        var typedToken = tokenize(token.trim());
        collector.push(typedToken);

    }
    let readingQuotes = false;
    let token = '';
    for (var i = (pos | 0); i < program.length; i++) {
        var char = program[i];
        if (char === '"') {
            readingQuotes = !readingQuotes;
            token = token + char;
            continue;
        }
        if (readingQuotes) {
            token = token + char;
        } else {
            if (char === '.' || char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                addToken(token);
                if (token.trim() === 'where') {
                    var innerCollector = [];
                    var end = read1(program, innerCollector, i + 1);
                    collector.push(innerCollector);
                    i = end;
                }
                token = '';
            }
            else if (char === '(') {
                var innerCollector = [];
                var end = read1(program, innerCollector, i + 1);
                collector.push(innerCollector);
                i = end;
            } else if (char === ')') {
                addToken(token);
                return i + 1;
            } else {
                token = token + char;
            }
        }
    }
    if (token.trim().length > 0) {
        addToken(token)
    }
    return i;
}

function evaluate(expr) {
    return evaluateUnderEnv(expr, ENV);
}

function evaluateUnderEnv(expr, env) {
    var expressionResult = expr.def && expr.fn ? expr : evaluateExprUnderEnv(expr, env);
    if (expr.def) {
        env.define(expr.name, expressionResult);
        return env.lookup(expr.name);
    }
    return expressionResult;
}

function evalSplFormExpr(expr, env) {
    var token = expr.expr[0];
    var val = undefined;
    if (ZHATYPE.isSymbol(token) && token.value === "if") {
        let predicate = evaluateToken(expr.expr[1], env);
        if (predicate === true) {
            val = evaluateToken(expr.expr[2], env);
        } else {
            val = expr.expr.length > 3 ? evaluateToken(expr.expr[3], env) : false;
        }
    }
    return val;
}

function evaluateExprUnderEnv(expr, env) {
    if (expr.isLiteral()) {
        return evaluateToken(expr.expr[0], env);
    } else if (expr.isSplForm()) {
        return evalSplFormExpr(expr, env);
    }
    var token = expr.expr[0];
    var val = evaluateToken(token, env);
    if (expr.expr.length > 1) {
        var args = [];
        for (var i = 1; i < expr.expr.length; i++) {
            args.push(evaluateToken(expr.expr[i], env));
        }
        if (isExpression(val)) {
            if (val.paramFilled + args.length === val.params.length) {
                var methodScope = Object.assign({}, val.env);
                for (i = 0; i < args.length; i++) {
                    var paramToFill = val.params[(val.paramFilled + i)].value;
                    methodScope[paramToFill] = args[i];
                }
                var scope = new ENVIRONMENT(methodScope, env);
                var envClone = {};
                //Set env based on where clause
                for (prop in val.env) {
                    if (isExpression(val.env[prop])) {
                        envClone[prop] = evaluateExprUnderEnv(val.env[prop], new ENVIRONMENT(envClone, scope));
                    }
                }
                val = evaluateExprUnderEnv(val, new ENVIRONMENT(envClone, scope));
            } else {
                val = cloneExpr(val, args);
            }
        } else {
            //its a Zha fn
            val = val.invoke(args);
        }

    }
    return val;
}

function evaluateToken(token, env) {
    if (isExpression(token)) {
        val = evaluateUnderEnv(token, env);
    } else if (ZHATYPE.isSymbol(token)) {
        val = env.lookup(token);
    } else if (ZHATYPE.isAtom(token)) {
        val = token.value;
    }
    return val;
}

function print(result) {

}

function run(srcStr) {
    var ast = read(srcStr);
    return evaluate(new EXPR(ast));
}

function REPL() {

}

function test() {}