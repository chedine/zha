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
        ZhaFn: function (fn, args, alreadyCurried) {
            this.value = {
                    f: !alreadyCurried ? curry(fn) : fn,
                    a: args
                },
                this.invoke = function (...args) {
                    var parameters = [];
                    for (var i = 0; i < args.length; i++) {
                        parameters.push(args[i].value);
                    }

                    var returnVal = this.value.f.apply(undefined, parameters);
                    return returnVal instanceof Function ?
                        new ZHATYPE.ZhaFn(returnVal, this.args, true) :
                        (ZHATYPE.isTyped(returnVal) ? returnVal : ZHATYPE.typeIfy(returnVal));
                }
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
function makeForeignFn1(fn, args) {
    return new ZHATYPE.ZhaFn(fn, args);
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
            if(pred){
                return ZHATYPE.isFn(truthyPath)? truthyPath() : truthyPath;
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

function EXPR (list) {
    this.expr = [];
    this.env = {};
    this.params=[];
    this.name = undefined;
    var i =0, j=0;
    var where =0, asgnmnt = 0;
    for(;i<list.length;i++){
        if(ZHATYPE.isSymbol(list[i]) && list[i].value === 'where'){
            where = i;
            break;
        }
    }
    for(;j<=i;j++){
        if(ZHATYPE.isSymbol(list[j]) && list[j].value === '='){
            asgnmnt = j;
            break;
        }
    }
    if(asgnmnt >0){
        this.name = list[0].value;
        this.params = list.slice(1,j);
        this.expr = list.slice(j+1, i);
    }
    else{
        this.expr = list.slice(0, i);
    }
    for(i=i+1;i<list.length;i++){
        this.env[list[i][0]] = new EXPR(list[i]);
    }
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
        
        if(token.trim() === 'where'){
            tokens.push(typedToken);
            token = '';
            tokens.push([]);
            nested.push(tokens.length - 1);
        }
        else if (nested.length === 0) {
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
            }
             else if (char === '.' || char === ' ' || char === '\t' || char === '\n' || char === '\r') {
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

function evaluate(ast) {
    return evaluateUnderEnv(ast, ENV);
}


function print(result) {

}

function run(srcStr) {
    return evaluate(read(srcStr));
}

function REPL() {

}

function test() {}