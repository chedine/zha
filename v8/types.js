var Zha = Zha || {};

; (function (zha, undefined) {

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
	//Number Type
	zha.Number = function (val) {
		this._meta = { type: 1 };
		this.value = val;
	}
	zha.Number.prototype = Number.prototype;
	zha.Number.prototype.type = function () {
		return new zha.Keyword(":Number");
	}
	zha.Number.prototype.valueOf = function () {
		return this.value;
	}
	zha.Number.prototype.add = function (n) {
		return new Zha.Number(this + n.value);
	}
	zha.Number.prototype.sub = function (n) {
		return new zha.Number(this.value - n.value);
	}
	zha.Number.prototype.div = function (n) {
		return new zha.Number(this.value / n.value);
	}
	zha.Number.prototype.mul = function (n) {
		return new zha.Number(this.value * n.value);
	}
	zha.Number.prototype.mod = function (n) {
		return new zha.Number(this.value % n.value);
	}
	zha.Number.prototype.pow = function (n) {
		return new zha.Number(Math.pow(this.value + n.value));
	}
	zha.Number.prototype.inc = function (n) {
		return new Zha.Number(this.value + 1);
	}
	zha.Number.prototype.dec = function (n) {
		return new Zha.Number(this.value - 1);
	}
	zha.Number.prototype.gt = function (n) {
		return new Zha.Boolean(this.value > n.value);
	}
	zha.Number.prototype.lt = function (n) {
		return new Zha.Boolean(this.value < n.value);
	}
	zha.Number.prototype.gtEq = function (n) {
		return new Zha.Boolean(this.value >= n.value);
	}
	zha.Number.prototype.ltEq = function (n) {
		return new Zha.Boolean(this.value <= n.value);
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

	//Boolean type
	zha.Boolean = function (val) {
		this.value = (val);
		this._meta = { type: 3 };
	}
	zha.Boolean.prototype = Boolean.prototype;
	zha.Boolean.prototype.type = function () {
		return new zha.Keyword(":Boolean");
	}
	zha.Boolean.prototype.valueOf = function () {
		return this.value;
	}
	zha.Boolean.prototype.and = function (other) {
		return new ZhaBoolean(this.value && other.value);
	}
	zha.Boolean.prototype.or = function (other) {
		return new ZhaBoolean(this.value || other.value);
	}
	zha.Boolean.prototype.not = function (other) {
		return new ZhaBoolean(!this.value);

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
	zha.Symbol.prototype.valueOf = function(){
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
	// ----- List
	Array.prototype.first = function(){
		return this[0];
	}
	Array.prototype.second = function(){
		return this[1];
	}
	Array.prototype.nth = function(n){
		return this[n];
	}
	Array.prototype.rest = function(){
		return this.slice(1);
	}
	Array.prototype.get = function(n){
		return this[n];
	}
	Array.prototype.last = function(){
		return this[this.length-1];
	}
	// ------ Vec 
	zha.Vec = function (val) {
		this.value = val;
		this._meta = { type: 7 };
	}
	//zha.Vec.prototype = zha.List.prototype;
	zha.Vec.prototype.type = function () {
		return new zha.Keyword(":Vec");
	}
	zha.Vec.prototype.valueOf = function () {
		return this.value;
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
	zha.HMap = class extends Val {
		//For now Vec behaves the same as List as Native Array type.
		constructor(val) {
			const obj = {};
			for (var i = 0; i < val.length - 1; i = i + 2) {
				obj[val[i].value] = val[i + 1];
			}
			super(obj);
			this._meta = { type: 9 };
		}
		make(seq) {
			return new zha.HMap(seq);
		}
		get(key) {
			return this.value[key.value];
		}
		set(k, v) {
			//TODO: Return a new Map
			obj[k.value] = v;
		}
		count() {
			return new zha.Number(Object.keys(this.value).length);
		}
		keys() {
			//Assumes keywords only used as keys
			const _keys = Object.keys(this.value);
			const _keyList = [];
			for (var i = 0; i < _keys.length; i++) {
				_keyList.push(new zha.Keyword(_keys[i]));
			}
			return new zha.Vec(_keyList);
		}
		type() {
			return new zha.Keyword(":HMap");
		}
	}
	zha.Component = class extends zha.HMap {
		constructor(val) {
			super(val);
			this._meta = { type: 10 };
		}
		type() {
			return new zha.Keyword(":Comp");
		}
	}
	// Type utils
	zha.ts = zha.ts || {};
	const NUMBER = new zha.Keyword(":Number");
	const STRING = new zha.Keyword(":String");
	const BOOLEAN = new zha.Keyword(":Boolean");
	const LIST = new zha.Keyword(":List");
	const VEC = new zha.Keyword(":Vec");
	const FN = new zha.Keyword(":Fn");
	const SYM = new zha.Keyword(":Symbol");
	const KEYWORD = new zha.Keyword(":Keyword");
	const HMAP = new zha.Keyword(":HMap");
	const COMPONENT = new zha.Keyword(":Comp");
	const NIL = new zha.Keyword(":Nil");
	const RETURN = new zha.Keyword(":Return");

	zha.ts.typeIfy = function (rawTxt) {
		if (rawTxt === "true" || rawTxt === true) {
			return new zha.Boolean(true);
		} else if (rawTxt === "false" || rawTxt === false) {
			return new zha.Boolean(false);
		}
		/**else if (rawTxt === "break" || rawTxt === "breakw") {
			return new zha.Keyword(rawTxt);
		}**/
		else if (!isNaN(parseFloat(rawTxt))) {
			return new zha.Number(parseFloat(rawTxt));
		} else if (rawTxt.startsWith('"') && rawTxt.endsWith('"')) {
			//Remove quotes
			return new zha.String(rawTxt.substring(1, rawTxt.length - 1), 2);
			//return new String(rawTxt.substring(1, rawTxt.length - 1), 2);
		}
		else if (rawTxt.startsWith(':')) {
			return new zha.Keyword(rawTxt);
		}
		else if (rawTxt === ("nil")) {
			return new zha.Nil();
		}
		else {
			return new zha.Symbol(rawTxt);
		}
	};

	zha.ts.isNumber = (z) => z.type().equals(NUMBER);
	zha.ts.isBool = (z) => z.type().equals(BOOLEAN);
	zha.ts.isFn = (z) => z.type && z.type().equals(FN);
	zha.ts.isList = (z) => Array.isArray();
	zha.ts.isVec = (z) => z.type().equals(VEC);
	zha.ts.isSeq = (z) => zha.ts.isList(z) || zha.ts.isVec(z);
	zha.ts.isString = (z) => z.type().equals(STRING);
	zha.ts.isKeyword = (z) => z.type && z.type().equals(KEYWORD);
	zha.ts.isSymbol = (z) => z.type().equals(SYM);
	zha.ts.isComponent = (z) => z.type().equals(COMPONENT);
	zha.ts.isNil = (z) => z.type().equals(NIL);
	zha.ts.isReturn = (z) => z.type().equals(RETURN);
	zha.ts.Nil = new zha.Nil();
	zha.ts.isZhaType = (z) => z !== undefined && z !== null && z.type; //TODO: InstanceOf perhaps ?? 

})(window.Zha = window.Zha || {});
