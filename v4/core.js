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
        }, ["pred", "truthyPath"])
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

function EXPR(list) {
    this.expr = [];
    this.env = {};
    this.params = [];
    this.name = undefined;
    this.def = false;
    this.fn = false;
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
        //this.expr = list.slice(j+1, i);
        addToExpr(this, list.slice(j + 1, i));
    } else {
        //this.expr = list.slice(0, i);
        addToExpr(this, list.slice(0, i));
    }
    for (i = i + 1; i < list.length; i++) {
        this.env[list[i][0]] = new EXPR(list[i]);
    }
    this.compute = function (scope) {
        var token = this.expr[0];
        //var env = new ENVIRONMENT(this.env, scope? scope: ENV);
        var env = new ENVIRONMENT(RT, undefined);
        if(this.def){
            return this.define();
        }
        var val = evaluateToken(token, env);
        if (this.expr.length > 1) {
            var args = [];
            for (var i = 1; i < this.expr.length; i++) {
                args.push(evaluateToken(this.expr[i], env));
            }
            if(ZHATYPE.isFn){
                val = val.invoke(args);
            }
            else{
                val = val.compute(this.paramsEnv(args));
            }
        }
        return val;
    };
    this.define = function(env){
        env.define(this.name, this);
        return env.lookup(this.name);
    };
    this.paramsEnv = function (args) {
        var env = {};
        if (Array.isArray(args)){
            for (var i = 0; i < args.length; i++) {
                env[this.params[i].value] = args[i]; 
            }
        }else{
            console.log("TODO1");
        }
        return env;
    };
    this.evalToken = function (token, env) {
        if (isExpression(token)) {
            val = token.compute(env);
        } else if (ZHATYPE.isSymbol(token)) {
            val = env.lookup(token);
            /**if (isExpression(val)) {
                val = evaluateExprUnderEnv(val, env);
            }**/
        } else if (ZHATYPE.isAtom(token)) {
            val = token.value;
        }
        return val;
    }
}

function isExpression(expr) {
    return expr instanceof EXPR;
}

function tokenize(token) {
    return ZHATYPE.typeIfy(token);
}

function read(program) {
    const ast = readExpr(program, 0, new ZHATYPE.ZhaList([]));
    return ast;
}

function readExpr(program, startPos, ast) {
    i = startPos;
    let readingQuotes = false,
        readingBraces = false,
        readingParens = false;
    var tokens = [];
    var token = '';
    var nested = [];
    const addToken = token => {
        if (token.trim().length === 0) {
            return;
        }
        var typedToken = tokenize(token);

        if (token.trim() === 'where') {
            tokens.push(typedToken);
            token = '';
            tokens.push([]);
            nested.push(tokens.length - 1);
        } else if (nested.length === 0) {
            tokens.push(typedToken);
        } else {
            tokens[nested[nested.length - 1]].push(typedToken);
        }
    }
    for (i = startPos; i < program.trim().length; i++) {
        const char = program.charAt(i);
        if (char === '"') {
            readingQuotes = !readingQuotes;
            token = token + char;
            continue;
        }
        if (readingQuotes) {
            token = token + char;
        } else {
            if (char === '[') {
                readingBraces = true;
            } else if (char === ']') {
                readingBraces = false;
            } else if (char === '(') {
                readingParens = true;
                addToken(token);
                token = '';
                tokens.push([]);
                nested.push(tokens.length - 1);
            } else if (char === ')') {
                readingParens = false;
                addToken(token);
                token = '';
                nested.pop();
            } else if (char === '.' || char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                addToken(token);
                token = '';
            } else {
                token = token + char;
            }
        }
    }
    if (token.trim().length > 0) {
        addToken(token)
    }
    return tokens;
}

function evaluate(expr) {
    return evaluateUnderEnv(expr, ENV);
}

function evaluateUnderEnv(expr, env) {
    if (expr.def) {
        env.define(expr.name, expr);
        return env.lookup(expr.name);
    }
    var expressionResult = evaluateExprUnderEnv(expr, env);
    return expressionResult;
}

function evaluateExprUnderEnv(expr, env) {
    var token = expr.expr[0];
    var val = evaluateToken(token, env);
    if (expr.expr.length > 1) {
        var args = [];
        for (var i = 1; i < expr.expr.length; i++) {
            args.push(evaluateToken(expr.expr[i], env));
        }
        val = val.invoke(args);
    }
    return val;
}

function evaluateToken(token, env) {
    if (isExpression(token)) {
        val = evaluateUnderEnv(token, env);
    } else if (ZHATYPE.isSymbol(token)) {
        val = env.lookup(token);
        if (isExpression(val)) {
            val = evaluateExprUnderEnv(val, env);
        }
    } else if (ZHATYPE.isAtom(token)) {
        val = token.value;
    }
    return val;
}

function print(result) {

}

function run(srcStr) {
    return evaluate(new EXPR(read(srcStr)));
}

function REPL() {

}

function test() {}