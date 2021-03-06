var Zha = Zha || {};

;
(function (zha, undefined) {

	Val = class {
		constructor(val) {
			this.value = val;
		}
		value() {
			return this.value;
		}
		eq(other) {
			return new zha.Boolean(this.value === other.value);
		}

		toNative() {
			return this.value;
		}
	}
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
		return new Zha.Boolean(this > n);
	}
	Number.prototype.lt = function (n) {
		return new Zha.Boolean(this < n);
	}
	Number.prototype.gtEq = function (n) {
		return new Zha.Boolean(this >= n);
	}
	Number.prototype.ltEq = function (n) {
		return new Zha.Boolean(this <= n);
	}



	// String Type
	zha.String = function (val) {
		this.value = val;
		this._meta = { type: 2 };
	}
	zha.String.prototype = String.prototype;
	zha.String.prototype.type = function () {
		return new zha.Keyword(":String");
	}
	zha.String.prototype.valueOf = function () {
		return this.value;
	}
	zha.String.prototype.toString = function () {
		return this.value;
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
	// ------ Vec 
	zha.Block = function (val) {
		this.value = val;
		this._meta = { type: 7 };
	}
	//zha.Vec.prototype = zha.List.prototype;
	zha.Block.prototype.type = function () {
		return new zha.Keyword(":Vec");
	}
	zha.Block.prototype.valueOf = function () {
		return this.value;
	}
	zha.Block.prototype.last = function () {
		return this.value[this.value.length - 1];
	}
	zha.Block.prototype.length = function () {
		return this.value.length;
	}

	zha.ZhaReturn = class extends Val {
		constructor(val) {
			super(val)
			this.meta = { type: -1 };
		}
		hasValue() {
			return this.value !== undefined;
		}
		type() {
			return new zha.Keyword(":Return");
		}
	}
	//Symbol type
	zha.Symbol = class extends Val {
		constructor(val) {
			super(val);
			this._meta = { type: 4 };
		}
		type() {
			return new Zha.Keyword(":Symbol");
		}
	}
	zha.Symbol.prototype.valueOf = function () {
		return this.value;
	}
	//NIL 
	zha.Nil = class {
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
	zha.Nil.prototype.valueOf = function () {
		return null;
	}
	// Keyword
	zha.Keyword = class extends Val {
		constructor(v) {
			super(v);
			this._meta = { type: 5 };
		}
		equals(other) {
			return other instanceof zha.Keyword && this.value === other.value;
		}
		type() {
			return new Zha.Keyword(":Keyword");
		}
		invoke(target) {
			return target.get(this);
		}
	}
	zha.Fn = class extends Val {
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
			return new zha.Keyword(":Fn");
		}
	}
	zha.HMap = class  {
		//For now Vec behaves the same as List as Native Array type.
		constructor(val) {
			//	const obj = {};
			for (var i = 0; i < val.length - 1; i = i + 2) {
				this[val[i].value] = val[i + 1];
			}
			//super(obj);
			this._meta = { type: 9 };
		}
		make(seq) {
			return new zha.HMap(seq);
		}
		get(key) {
			return this[key.value];
		}
		set(k, v) {
			//TODO: Return a new Map
			this[k.value] = v;
		}
		count() {
			return new Number(Object.keys(this).length);
		}
		keys() {
			//Assumes keywords only used as keys
			const _keys = Object.keys(this);
			const _keyList = [];
			for (var i = 0; i < _keys.length; i++) {
				_keyList.push(new zha.Keyword(_keys[i]));
			}
			return [].concat(_keyList);
		}
		type() {
			return new zha.Keyword(":HMap");
		}
	}
	// Type utils
	zha.ts = zha.ts || {};
	const NUMBER = new zha.Keyword(":Number");
	const STRING = new zha.Keyword(":String");
	const BOOLEAN = new zha.Keyword(":Boolean");
	const LIST = new zha.Keyword(":List");
	const Block = new zha.Keyword(":Vec");
	const FN = new zha.Keyword(":Fn");
	const SYM = new zha.Keyword(":Symbol");
	const KEYWORD = new zha.Keyword(":Keyword");
	const HMAP = new zha.Keyword(":HMap");
	const COMPONENT = new zha.Keyword(":Comp");
	const NIL = new zha.Keyword(":Nil");
	const RETURN = new zha.Keyword(":Return");

	zha.ts.typeIfy = function (rawTxt) {
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
			return new zha.Keyword(rawTxt);
		} else if (rawTxt === ("nil")) {
			return new zha.Nil();
		} else {
			return new zha.Symbol(rawTxt);
		}
	};

	zha.ts.isNumber = (z) => typeof z === "number" || z instanceof Number;
	zha.ts.isBool = (z) => typeof z === "boolean" || z instanceof Boolean ;
	zha.ts.isFn = (z) => z.type && z.type().equals(FN);
	zha.ts.isList = (z) => Array.isArray(z);
	zha.ts.isBlock = (z) => z.type && z.type().equals(Block);
	zha.ts.isSeq = (z) => zha.ts.isList(z) || zha.ts.isBlock(z);
	zha.ts.isString = (z) => typeof z === "string" || z instanceof String;
	zha.ts.isKeyword = (z) => z.type && z.type().equals(KEYWORD);
	zha.ts.isSymbol = (z) => z.type && z.type().equals(SYM);
	zha.ts.isNil = (z) => z.type && z.type().equals(NIL);
	zha.ts.isReturn = (z) => z.type && z.type().equals(RETURN);
	zha.ts.Nil = new zha.Nil();
	zha.ts.isZhaType = (z) => z !== undefined && z !== null && z.type; //TODO: InstanceOf perhaps ?? 

})(window.Zha = window.Zha || {});