//RT
/**const ZHATYPE = function () {
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
                var returnVal = this.value.apply(undefined,[env,args]);
                return returnVal;
            };
            this.toString = function () {
                return "fn : " + this.value;
            }
        },
        ZhaList: function (array) {
            this.value =  mori.isList(array)? array: mori.list.apply(undefined, array);
            this.type = 4;
            this.toString = function () {
                return this.value.toString();
            },
            this.conj = function(el){
        		return new ZHATYPE.ZhaList(mori.conj(this.value, el));
        	},
        	this.assoc = function(i, el){
        		//i is a ZhaNumber
        		return new ZHATYPE.ZhaList(mori.assoc(this.value, i.value, el));
        	},
        	this.dissoc = function(i, el){
        		return new ZHATYPE.ZhaList(mori.dissoc(this.value, i.value, el));
        	},
        	this.get = function(i,defaultVal){
        		return (mori.get(this.value, i.value, defaultVal));
        	}
        },
        ZhaVec: function(array) {
        	//TODO: Expectes input to be an array
        	this.value = mori.isVector(array)? array: mori.vector.apply(undefined, array);
        	this.conj = function(el){
        		return new ZHATYPE.ZhaVec(mori.conj(this.value, el));
        	},
        	this.assoc = function(i, el){
        		//i is a ZhaNumber
        		return new ZHATYPE.ZhaVec(mori.assoc(this.value, i.value, el));
        	},
        	this.dissoc = function(i, el){
        		return new ZHATYPE.ZhaVec(mori.dissoc(this.value, i.value, el));
        	},
        	this.get = function(i,defaultVal){
        		return (mori.get(this.value, i.value, defaultVal));
        	}
        },
        ZhaSymbol: function (symStr) {
            this.value = symStr;
            this.type = 5;
        },
        makeIterable:function (arr , src){
        	if(src instanceof ZHATYPE.ZhaList){
        		return new ZHATYPE.ZhaList(arr);
        	}else if(src instanceof ZHATYPE.ZhaVec){
        		return new this.ZhaVec(arr);
        	}
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
        isVec: function (zhaVal){
        	return zhaVal instanceof this.ZhaVec;
        },
        isString: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaString;
        },
        isFn: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaFn;
        },
        isIterable: function(zhaVal){
        	return mori.isSeq(zhaVal.value) || (zhaVal instanceof this.ZhaVec);
        },
        isSymbol: function (zhaAtom) {
            return zhaAtom instanceof this.ZhaSymbol;
        },
        isTyped: function (value) {
            return value instanceof this.ZhaBoolean || value instanceof this.ZhaFn ||
                value instanceof this.ZhaList || value instanceof this.ZhaNumber ||
                value instanceof this.ZhaString || value instanceof this.ZhaSymbol || value instanceof this.ZhaVec
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
**/

const RT = function () {
    return {
        "+": (a, b) => new _Zha$.ZhaNumber(a.value + b.value),
        "-": (a, b) => new _Zha$.ZhaNumber(a.value - b.value),
        "*": (a, b) => new _Zha$.ZhaNumber(a.value * b.value),
        "/": (a, b) => new _Zha$.ZhaNumber(a.value / b.value),
        "<": (a, b) => new _Zha$.ZhaBoolean(a.value < b.value),
        "<=": (a, b) => new _Zha$.ZhaBoolean(a.value <= b.value),
        ">": (a, b) => new _Zha$.ZhaBoolean(a.value > b.value),
        "eq": (a, b) => new _Zha$.ZhaBoolean(a.value === b.value),
        "list": function (...rest) {
            return new _Zha$.ZhaList(rest);
        },
        "vec": function (...rest) {
            return new _Zha$.ZhaVec(rest);
        },
        "conj": (seq, el) => seq.conj(el),
        "get": (seq, index) => seq.get(index),
        "nth" : (seq, n) => seq.nth(n),
        "count" : new _Zha$.ZhaFn((seq) => seq[0].count()),
        "last" : new _Zha$.ZhaFn((seq) => seq[0].last()),
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
};
const ENV = new ENVIRONMENT(RT, undefined);