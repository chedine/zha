var Zha = Zha || {};

; (function (zha, undefined) {

	Val = class {
		constructor(val){
			this.value = val;
		}
		value(){
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
		type() {
			return new zha.Keyword(":Number");
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
		asVec(arrayOfStr){
			if(arrayOfStr === null || arrayOfStr === undefined){
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
		add(str1){
			return new zha.String(this.value + str1.value);
		}
		type() {
			return new zha.Keyword(":String");
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
		type(){
			return new Zha.Keyword(":Boolean");
		}
	}
	//Symbol type
	zha.Symbol = class extends Val{
		constructor(val){
			super(val);
			this._meta = {type: 4};
		}
		type(){
			return new Zha.Keyword(":Symbol");
		}
	}
	//NIL 
	zha.Nil = class{
		constructor(){
			this.value = null;
			this._meta = {type: -1};
		}
		type(){
			return new Zha.Keyword(":Nil");
		}
	}
	// Keyword
	zha.Keyword = class extends Val{
		constructor(v){
			super(v);
			this._meta = {type: 5};
		}
		equals(other){
			return other instanceof zha.Keyword && this.value === other.value ;
		}
		type(){
			return new Zha.Keyword(":Keyword");
		}
	}
	ZhaSeq = class extends Val {
		constructor(val) {
			super([...val]);
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
		updatein(i,el){

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
			return this.make(this.value.slice(0,n));
		}
		takeLast(n) {
			const s = this.value.length - n;
			return this.takeFrom(s, this.value.length);
		}
		takeFrom(start, n) {
			return this.make(this.value.slice(start, start+n));
		}
	}
	
	zha.List = class extends ZhaSeq {
		constructor(val){
			super(val);
			this._meta = {type: 6};
		}
		make(seq) {
			return new zha.List(seq);
		}
		type(){
			return new zha.Keyword(":List");
		}
	 }
	zha.Vec = class extends zha.List { 
		//For now Vec behaves the same as List as Native Array type.
		constructor(val){
			super(val);
			this._meta = {type: 7};
		}
		make(seq) {
			return new zha.Vec(seq);
		}
		type(){
			return new zha.Keyword(":Vec");
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

	zha.ts.typeIfy = function (rawTxt) {
		if (rawTxt === "true" || rawTxt === true) {
			return new zha.Boolean(true);
		} else if (rawTxt === "false" || rawTxt === false) {
			return new zha.Boolean(false);
		} else if (!isNaN(parseFloat(rawTxt))) {
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
	zha.ts.isFn = (z) => z.type().equals(FN);
	zha.ts.isList = (z) => z.type().equals(LIST);
	zha.ts.isVec = (z) => z.type().equals(VEC);
	zha.ts.isString = (z) => z.type().equals(STRING);
	zha.ts.isKeyword = (z) => z.type().equals(KEYWORD);
	zha.ts.isSymbol = (z) => z.type().equals(SYM);

})(window.Zha = window.Zha || {});
