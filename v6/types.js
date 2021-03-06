var _Zha$ = function types() {
	var _self = this;
	const _internals = Symbol('_internals');

	class ZhaVal {
		constructor(val) {
			this.value = val;
		}
		toString() {
			return this.value;
		}
	}
	class ZhaLiteral extends ZhaVal {
	}
	class ZhaNumber extends ZhaLiteral {
		constructor(val) {
			super(val);
			this._meta = { type: 1 };
		}		
		add(n){
			return new ZhaNumber(this.value+n.value);
		}
		sub(n){
			return new ZhaNumber(this.value - n.value);
		}
		div(n){
			return new ZhaNumber(this.value / n.value);
		}
		mul(n){
			return new ZhaNumber(this.value * n.value);
		}
		mod(n){
			return new ZhaNumber(this.value % n.value);
		}
		pow(n){
			return new ZhaNumber(Math.pow(this.value+n.value));
		}

	}
	class ZhaString extends ZhaLiteral {
		constructor(val) {
			super(val);
			this._meta = { type: 2 };
		}
		count() {
			return new ZhaNumber(this.value.length);
		}

		toString() {
			return `"${this.value}"`;
		}
	}
	class ZhaBoolean extends ZhaLiteral {
		constructor(val) {
			super(val);
			this._meta = { type: 3 };
		}
		and(other){
			return new ZhaBoolean(this.value && other.value);
		}
		or(other){
			return new ZhaBoolean(this.value || other.value);
		}
		not(other){
			return new ZhaBoolean(!this.value);
		}
		
	}
	class ZhaSymbol extends ZhaVal {
		constructor(val) {
			super(val);
			this._meta = { type: 4 };
		}
		toString() {
			return this.value;
		}
	}
	class ZhaKeyword {
		constructor(val) {
			this.value = val;
			this._meta = { type: 0 }
		}
		toString() {
			return this.value;
		}
		equals(zhaVal) {
			return this._meta.type === zhaVal._meta.type && this.value === zhaVal.value;
		}
	}
	class ZhaFn extends ZhaVal {
		constructor(fn, name, args, env, curried = false) {
			super(fn);
			this._prefills = [];
			this.env = env;
			this._meta = { type: 5, name: name, args: args, curried: curried };
		}
		invoke(arrayOfArgs,env) {
			if (!this._meta.curried) {
				var returnVal = this.value.apply(undefined, [arrayOfArgs, env]);
				return returnVal;
			}
			else {
				var isFulfilled = this._prefills.length + arrayOfArgs.length === this._meta.args.length;
				if (isFulfilled) {
					var fullArgsList = this._prefills.concat(arrayOfArgs);
					var returnVal = this.value.apply(undefined, [fullArgsList, this.env]);
					return returnVal;
				}
				else {
					const curried = new ZhaFn(this.value, this._meta.name, this._meta.args, this.env,true);
					curried._prefills.concat(this._prefills);
					for (var i = 0; i < arrayOfArgs.length; i++) {
						curried._prefills.push(arrayOfArgs[i]);
					}
					return curried;
				}
			}
		}
	}
	class ZhaAsyncFn extends ZhaFn {
		invoke(arrayOfArgs) {
			var results = super.invoke(arrayOfArgs);
			if (results instanceof Promise) {
				var handlerArray = arrayOfArgs[arrayOfArgs.length - 1]; //last
				if(handlerArray !== undefined){
					var operation = handlerArray;
						results = results.then((d) => {
							if (_Zha$.isFn(operation)) {
								return operation.invoke([d], this.env);
							}
							var resolvedOP = env.lookup(operation);
							if (_Zha$.isFn(resolvedOP)) {
								console.log("Thenable fn " + d);
								return resolvedOP.invoke([d], this.env);
							}
						});
				}
			}
			return results;
		}
	}
	class ZhaSeq extends ZhaVal {
		constructor(val) {
			super([...val]);
		}
		conj(el) {
			return this.make([...this.value, el]);
		}
		concat(seq){
			return this.make(this.value.concat(seq.value));
		}
		assoc(i, el) {
			var _new = [...this.value];
			_new[i] = el;
			return this.make(_new);
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
			return new _Zha$.ZhaNumber(this.value.length);
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
		rest(){
			return this.make(this.value.slice(1));
		}
		drop(n){
			return this.make(this.value.slice(n.value));
		}
		take(n){
			return this.takeRange(0,n);
		}
		takeLast(n){
			const s = this.value.length-n;
			return this.takeRange(s,this.value.length);
		}
		takeRange(start, n){
			return this.make(this.value.slice(start,n));
		}
		toString() {
			return mori.toJs(this.value);
		}
	}

	class ZhaVec extends ZhaSeq {
		constructor(val) {
			super(val);
		}
		make(seq) {
			return new ZhaVec(seq);
		}
	}
	class ZhaMap extends ZhaVal {
		constructor(val) {
			var _map = {};
			for (var i = 0; i < val.length; i += 2) {
				_map[val[i].value] = val[i + 1];
			}
			super(_map);
		}
		get(key) {
			return this.value[key.value];
		}
	}
	class ZhaAST {
		constructor(name, params, body, where) {
			this.name = name;
			this.params = params;
			if (body.length > 1) {
				this.body = body;
			}
			else {
				//form has just one element. It could be an atom(literal) like 2 or "Hello". Or a seq like [1,2,3]
				this.body = body[0];
			}
			//this.body = body.length === 1 && !Array.isArray(body[0]) ? body[0]: body;

			this.bindings = where;
			this.isFn = name !== undefined && (params !== undefined && params.length > 0);
			this.compiled = undefined;
		}
		compile() {
			if (this.isFn) {
				var args = '';
				for (var i = 0; i < this.params.length; i++) {
					args += this.params[i].value;
					if (i < this.params.length - 1) {
						args += ',';
					}
				}
				var compiled = `function ${this.name} (${args}) {
					return ${this.body[0]} (${args});
				}`;
				console.log(compiled);
				eval(compiled);
				this.compiled = compiled;
			}
		}
	}
	class ZhaError{
		constructor(val) {
			this.value = val;
		}
	}
	class ZhaNil extends ZhaVal{
		constructor(){
			super(null);
		}
	}
	return {
		isLiteral: (v) => v instanceof ZhaLiteral,
		isSeq: (v) => v instanceof ZhaSeq,
		isSymbol: (v) => v instanceof ZhaSymbol,
		isList: (v) => v instanceof ZhaVec,
		isFn: (v) => v instanceof ZhaFn,
		isKeyword: (v) => v instanceof ZhaKeyword,
		ZhaBoolean: ZhaBoolean,
		ZhaNumber: ZhaNumber,
		ZhaString: ZhaString,
		//ZhaList: ZhaList,
		ZhaVec: ZhaVec,
		//	ZhaRange: ZhaRange,
		ZhaSymbol: ZhaSymbol,
		ZhaFn: ZhaFn,
		ZhaKeyword: ZhaKeyword,
		ZhaAST: ZhaAST,
		ZhaMap: ZhaMap,
		ZhaAsyncFn: ZhaAsyncFn,
		ZhaError:ZhaError,
		ZhaNil:ZhaNil
	}
}();

function _typeIfy(literal) {
	if (literal === "true" || literal === true) {
		return new _Zha$.ZhaBoolean(true);
	} else if (literal === "false" || literal === false) {
		return new _Zha$.ZhaBoolean(false);
	} else if (!isNaN(parseFloat(literal))) {
		return new _Zha$.ZhaNumber(parseFloat(literal));
	} else if (literal.startsWith('"') && literal.endsWith('"')) {
		//Remove quotes
		return new _Zha$.ZhaString(literal.substring(1, literal.length - 1), 2);
		//return new String(literal.substring(1, literal.length - 1), 2);
	}
	else if (literal.startsWith(':')) {
		return new _Zha$.ZhaKeyword(literal);
	} else {
		return new _Zha$.ZhaSymbol(literal);
	}
}
const curryz = f => {
	const aux = (n, xs) =>
		n === 0 ? f(...xs) : x => aux(n - 1, [...xs, x])
	return aux(f.length, [])
}
const isZhaAst = (o) => o instanceof ZhaAST;

/**
 * Add all custom methods to the native prototypes as well.
 * For ex: Add String.prototype.count to support the same op on the native string type.
 * for smooth interop
 */