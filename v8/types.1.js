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

		toNative(){
			return this.value;	
		}
	}
	//Number Type
	zha.Number = class extends Val {
		constructor(val) {
			super(val);
			this._meta = { type: 1 };
		}
		add(n) {
			return new Zha.Number(this.value + n.value);
		}
		sub(n) {
			return new zha.Number(this.value - n.value);
		}
		div(n) {
			return new zha.Number(this.value / n.value);
		}
		mul(n) {
			return new zha.Number(this.value * n.value);
		}
		mod(n) {
			return new zha.Number(this.value % n.value);
		}
		pow(n) {
			return new zha.Number(Math.pow(this.value + n.value));
		}
		inc(n){
			return new Zha.Number(this.value + 1);
		}
		dec(n){
			return new Zha.Number(this.value - 1);
		}
		gt(n){
			return new Zha.Boolean(this.value > n.value);
		}
		lt(n){
			return new Zha.Boolean(this.value < n.value);
		}
		gtEq(n){
			return new Zha.Boolean(this.value >= n.value);
		}
		ltEq(n){
			return new Zha.Boolean(this.value <= n.value);
		}
		type() {
			return new zha.Keyword(":Number");
		}
	}
	zha.ZhaReturn = class extends Val {
		constructor(val){
			super(val)
			this.meta = {type: -1};
		}
		hasValue(){
			return this.value !== undefined;
		}
		type() {
			return new zha.Keyword(":Return");
		}
	}
	// String Type
	zha.String = class extends Val {
		constructor(val) {
			super(val);
			this._meta = { type: 2 };
		}
		count() {
			return new zha.Number(this.value.length);
		}
		asVec(arrayOfStr) {
			if (arrayOfStr === null || arrayOfStr === undefined) {
				return new zha.Nil();
			}
			const s1 = [];
			for (var i = 0; i < arrayOfStr.length; i++) {
				s1.push(new zha.String(arrayOfStr[i]));
			}
			return new zha.Vec(s1);
		}
		split(delim) {
			const s = this.value.split(delim.value);
			return this.asVec(s);
		}
		match(regex) {
			function r(inputstring) {
				var regParts = inputstring.match(/^\/(.*?)\/([gim]*)$/);
				if (regParts) {
					// the parsed pattern had delimiters and modifiers. handle them.
					return new RegExp(regParts[1], regParts[2]);
				} else {
					// we got pattern string without delimiters
					return new RegExp(inputstring);
				}
			}
			const s = this.value.match(r(regex.value));
			return this.asVec(s);
		}
		add(str1) {
			return new zha.String(this.value + str1.value);
		}
		type() {
			return new zha.Keyword(":String");
		}
		toUpperCase(){
			return new zha.String(this.value.toUpperCase());
		}
		toLowerCase(){
			return new zha.String(this.value.toLower());
		}
		substring(index){
			return new zha.String(this.value.substring(index.value));
		}
		first(index){
			return new zha.String(this.value.substring(0,1));
		}
		second(index){
			return new zha.String(this.value.substring(1,1));
		}
		third(index){
			return new zha.String(this.value.substring(2,1));
		}
		rest(index){
			return new zha.String(this.value.substring(1,this.value.length));
		}
		last(index){
			return new zha.String(this.value.substring(this.value.length-1));
		}
	}
	//Boolean type
	zha.Boolean = class extends Val {
		constructor(val) {
			super(val);
			this._meta = { type: 3 };
		}
		and(other) {
			return new ZhaBoolean(this.value && other.value);
		}
		or(other) {
			return new ZhaBoolean(this.value || other.value);
		}
		not(other) {
			return new ZhaBoolean(!this.value);
		}
		
		type() {
			return new Zha.Keyword(":Boolean");
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
		invoke(target){
			return target.get(this);
		}
	}
	ZhaSeq = class extends Val {
		constructor(val) {
			if (val) {
				super([...val]);
			}
			else {
				super([]);
			}
		}
		conj(el) {
			return this.make([...this.value, el]);
		}
		concat(seq) {
			return this.make(this.value.concat(seq.value));
		}
		assoc(i, el) {
			var _new = [...this.value];
			_new[i] = el;
			return this.make(_new);
		}
		updatein(i, el) {

		}
		get(i, defaultValue) {
			//TODO: Support default value
			return this.nth(i);
		}
		nth(i) {
			return this.value[i];
		}
		last() {
			return this.value[this.value.length - 1];
		}
		trash() {
			return this.make([]);
		}
		count() {
			return new zha.Number(this.value.length);
		}
		reverse() {
			return this.make([...this.value].reverse());
		}
		first() {
			return this.value[0];
		}
		second() {
			return this.value[1];
		}
		third() {
			return this.value[2];
		}
		rest() {
			return this.make(this.value.slice(1));
		}
		drop(n) {
			return this.make(this.value.slice(n.value));
		}
		take(n) {
			return this.make(this.value.slice(0, n));
		}
		takeLast(n) {
			const s = this.value.length - n;
			return this.takeFrom(s, this.value.length);
		}
		takeFrom(start, n) {
			return this.make(this.value.slice(start, start + n));
		}
		slice(start, total) {
			return this.make(this.value.slice(start.value, total.value));
		}
	}

	zha.List = class extends ZhaSeq {
		constructor(val) {
			super(val);
			this._meta = { type: 6 };
		}
		make(seq) {
			return new zha.List(seq);
		}
		type() {
			return new zha.Keyword(":List");
		}
	}
	zha.Vec = class extends zha.List {
		//For now Vec behaves the same as List as Native Array type.
		constructor(val) {
			super(val);
			this._meta = { type: 7 };
		}
		make(seq) {
			return new zha.Vec(seq);
		}
		type() {
			return new zha.Keyword(":Vec");
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
	zha.HMap = class extends Val {
		//For now Vec behaves the same as List as Native Array type.
		constructor(val) {
			const obj = {};
			for(var i=0;i<val.length-1;i=i+2){
				obj[val[i].value] = val[i+1];
			}
			super(obj);
			this._meta = { type: 9 };
		}
		make(seq) {
			return new zha.HMap(seq);
		}
		get(key){
			return this.value[key.value];
		}
		set(k,v){
			//TODO: Return a new Map
			obj[k.value] = v;
		}
		count(){
			return new zha.Number(Object.keys(this.value).length);
		}
		keys(){
			//Assumes keywords only used as keys
			const _keys = Object.keys(this.value);
			const _keyList = [];
			for(var i=0;i<_keys.length;i++){
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
	zha.ts.isList = (z) => z.type().equals(LIST);
	zha.ts.isVec = (z) => z.type().equals(VEC);
	zha.ts.isSeq = (z) => zha.ts.isList(z) || zha.ts.isVec(z);
	zha.ts.isString = (z) => z.type().equals(STRING);
	zha.ts.isKeyword = (z) => z.type && z.type().equals(KEYWORD);
	zha.ts.isSymbol = (z) => z.type().equals(SYM);
	zha.ts.isComponent = (z) => z.type().equals(COMPONENT);
	zha.ts.isNil = (z) => z.type().equals(NIL);
	zha.ts.isReturn = (z) => z.type().equals(RETURN);
	zha.ts.Nil = new zha.Nil();
	zha.ts.isZhaType = (z) => z !== undefined && z!== null && z.type ; //TODO: InstanceOf perhaps ?? 

})(window.Zha = window.Zha || {});
