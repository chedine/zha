'use strict';
Number.prototype.add = function (n) {
    return new Number(this + n);
}
Number.prototype.sub = function (n) {
    return new Number(this - n);
}
Number.prototype.div = function (n) {
    return new Number(this / n);
}
Number.prototype.mul = function (n) {
    return new Number(this * n);
}
Number.prototype.mod = function (n) {
    return new Number(this % n);
}
Number.prototype.pow = function (n) {
    return new Number(Math.pow(this + n));
}
Number.prototype.inc = function (n) {
    return new Number(this + 1);
}
Number.prototype.dec = function (n) {
    return new Number(this - 1);
}
Number.prototype.gt = function (n) {
    return new this.Boolean(this > n);
}
Number.prototype.lt = function (n) {
    return new this.Boolean(this < n);
}
Number.prototype.gtEq = function (n) {
    return new this.Boolean(this >= n);
}
Number.prototype.ltEq = function (n) {
    return new this.Boolean(this <= n);
}

Boolean.prototype.and = function (other) {
    return new Boolean(this && other);
}
Boolean.prototype.or = function (other) {
    return new Boolean(this || other);
}
Boolean.prototype.not = function (other) {
    return new Boolean(!this);

}
// ----- List
Array.prototype.first = function () {
    return this[0];
}
Array.prototype.second = function () {
    return this[1];
}
Array.prototype.nth = function (n) {
    return this[n];
}
Array.prototype.rest = function () {
    return this.slice(1);
}
Array.prototype.get = function (n) {
    return this[n];
}
Array.prototype.last = function () {
    return this[this.length - 1];
}
Array.prototype.conj = function (v) {
    return this.concat(v);
}


function ZhaType(_zha) {
    const Val = class {
        constructor(val) {
            this.value = val;
        }
        value() {
            return this.value;
        }
        eq(other) {
            return (this.value === other.value);
        }
    
        toNative() {
            return this.value;
        }
    }
    // ------ Vec 
    this.Block = function (val) {
        this.value = val;
        this._meta = { type: 7 };
    }
    //this.Vec.prototype = this.List.prototype;
    this.Block.prototype.type = function () {
        return new Zha.Keyword(":Vec");
    }
    this.Block.prototype.valueOf = function () {
        return this.value;
    }
    this.Block.prototype.last = function () {
        return this.value[this.value.length - 1];
    }
    this.Block.prototype.length = function () {
        return this.value.length;
    }

    this.ZhaReturn = class extends Val {
        constructor(val) {
            super(val)
            this.meta = { type: -1 };
        }
        hasValue() {
            return this.value !== undefined;
        }
        type() {
            return new Zha.Keyword(":Return");
        }
    }
    //Symbol type
    this.Symbol = class extends Val {
        constructor(val) {
            super(val);
            this._meta = { type: 4 };
        }
        type() {
            return new Zha.Keyword(":Symbol");
        }
    }
    this.Symbol.prototype.valueOf = function () {
        return this.value;
    }
    //NIL 
    this.Nil = class {
        constructor() {
            this.value = null;
            this._meta = { type: -1 };
        }
        type() {
            return new Zha.Keyword(":Nil");
        }
        valueOf() {
            return null;
        }
    }
    this.Nil.prototype.valueOf = function () {
        return null;
    }
    // Keyword
    this.Keyword = class extends Val {
        constructor(v) {
            super(v);
            this._meta = { type: 5 };
        }
        equals(other) {
            return other instanceof Zha.Keyword && this.value === other.value;
        }
        type() {
            return new Zha.Keyword(":Keyword");
        }
        invoke(target) {
            const val =  target[this.value];
            /** if(Zha.ts.isFn(val)){
                return val.invoke();
            }**/
            return val;
        }
    }
    this.Fn = class extends Val {
        //For now Vec behaves the same as List as Native Array type.
        constructor(val, fnargs) {
            super(val);
            this._meta = { type: 8, args: fnargs };
        }
        invoke(args) {
            //TODO: env may be needed to curry the fn
            return this.value.apply(undefined, [args]);
        }
        type() {
            return new Zha.Keyword(":Fn");
        }
    }
    // Type utils
    const NUMBER = new this.Keyword(":Number");
    const STRING = new this.Keyword(":String");
    const BOOLEAN = new this.Keyword(":Boolean");
    const LIST = new this.Keyword(":List");
    const Block = new this.Keyword(":Vec");
    const FN = new this.Keyword(":Fn");
    const SYM = new this.Keyword(":Symbol");
    const KEYWORD = new this.Keyword(":Keyword");
    const HMAP = new this.Keyword(":HMap");
    const COMPONENT = new this.Keyword(":Comp");
    const NIL = new this.Keyword(":Nil");
    const RETURN = new this.Keyword(":Return");

    this.typeIfy = function (rawTxt) {
        if (rawTxt === "true" || rawTxt === true) {
            return true;
        } else if (rawTxt === "false" || rawTxt === false) {
            return false;
        } else if (!isNaN(parseFloat(rawTxt))) {
            return new Number(parseFloat(rawTxt));
        } else if (rawTxt.startsWith("`")) {
            return (rawTxt.substring(1));
        } else if (rawTxt.startsWith('"') && rawTxt.endsWith('"')) {
            //Remove quotes
            return rawTxt.substring(1, rawTxt.length - 1);
            //return new String(rawTxt.substring(1, rawTxt.length - 1), 2);
        } else if (rawTxt.startsWith(':')) {
            return new this.Keyword(rawTxt); //String(rawTxt.substr(1)); 
        } else if (rawTxt === ("nil")) {
            return new this.Nil();
        } else {
            return new this.Symbol(rawTxt);
        }
    };

    this.isNumber = (z) => typeof z === "number" || z instanceof Number;
    this.isBool = (z) => typeof z === "boolean" || z instanceof Boolean;
    this.isFn = (z) => z.type && z.type().equals(FN);
    this.isList = (z) => Array.isArray(z);
    this.isBlock = (z) => z.type && z.type().equals(Block);
    this.isSeq = (z) => this.isList(z) || this.isBlock(z);
    this.isString = (z) => typeof z === "string" || z instanceof String;
    this.isKeyword = (z) => z.type && z.type().equals(KEYWORD);
    this.isSymbol = (z) => z.type && z.type().equals(SYM);
    this.isNil = (z) => z.type && z.type().equals(NIL);
    this.isReturn = (z) => z.type && z.type().equals(RETURN);
    this.isHMap = (z) => ((typeof z) === "object") && z["__source"] === "Zha";
    this.Nil = new this.Nil();
    this.isZhaType = (z) => z !== undefined && z !== null && z.type; //TODO: InstanceOf perhaps ?? 
}

