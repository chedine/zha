function Symbol(token) {
	this.value = token;
	this.type = 3; //Array.isArray(token) ? 1 : 0;
	this.__lang = 'symbol';
	this.isList = function () {
		return this.type === 1;
	}
	this.isSymbol = function () {
		return this.type === 0;
	}
}

function ENV(rt, env) {
	this.env = env;
	this.root = rt;
	this.lookup = function (symbol) {
		var key = symbol;
		var value;
		if (this.env.hasOwnProperty(key)) {
			value = this.env[key];
		} else if (this.root) {
			value = this.root.lookup(symbol);
		} else {
			console.error(key + " not available in environment");
			//TODO : Fix by raising error.
			//return undefined;
		}
		if (isSymbol(value)) {
			return this.lookup(value);
		} else {
			return value;
		}
	},
	this.isPresent = function(symbol){
		var key = symbol;
		var value;
		if (this.env.hasOwnProperty(key)) {
			return true;
		} else if (this.root) {
			return this.root.isPresent(symbol);
		} else {
			return false;
		}
	},
	this.define = function(sym, val){
		this.env[sym.value] = val;
	}
}

function ZhaList(array) {
	this.value = array || [];// || new Nothing();
	this.__lang = 'zhaList';
	this.isList = function () {
		return true;
	}
	this.isEmpty = function(){
		return !this.value || this.value.length === 0;
	}
	
	this.first = function(){
		return this.value[0];
	}
	this.second = function(){
		return this.value[1];
	}
	this.nth = function(n){
		return this.value[n];
	}
	this.size = function(){
		return this.value.length;
	}
	this.push= function(el){
		if(!this.value){
			this.value = [];
		}
		this.value.push(el);
	}
	this.rest = function(){
		return new ZhaList(this.value.slice(1));
	}
}

function ZhaFn(fn, dynamic){
	this.value = fn;
	this.dynamic = dynamic;
	this.filledArgs = [];
	this.isMacro = false;
	this.invoke = async function(params){
		var output;
		if(!dynamic){
		//Params is a ZhaList of arg values;
			output =  await this.value.apply(undefined,params.value);
		}
		else{
			output = await this.value(params);
		}
		if(output instanceof Function){
			return new ZhaFn(output, this.dynamic);
		}
		return output;
	}
}
function Nothing(){
	this.__lang = "zha_nothing";
}

function Atom(val, type) {
	this.value = val;
	this.__lang = 'literal';
	this.type = type;
	this.isString = function(){
		return this.type === 2;
	}
	this.isNumber = function(){
		return this.type === 1;
	}
	this.isBool = function(){
		return this.type === 0;
	}
}

function isSymbol(target) {
	return target && target instanceof Symbol;
}

function isList(target) {
	return target && target instanceof ZhaList;
}

function isNothing(target) {
	return target && target instanceof Nothing;
}

function isAtom(target) {
	return target && target instanceof Atom;
}

const typeIfy = function (literal) {
	if (literal === "true") {
		return new Atom(true, 0);
	} else if (literal === "false") {
		return new Atom(false, 0);
	} else if (!isNaN(parseFloat(literal))) {
		return new Atom(parseFloat(literal), 1);
	} else if (literal.startsWith('"') && literal.endsWith('"')) {
		//Remove quotes
		return new Atom(literal.substring(1, literal.length - 1), 2);
	} else {
		return new Symbol(literal);
	}
}

Atom.prototype.invoke = function(applicator){
	return this.value[applicator];
}

Atom.prototype.add = function() {
	return function(next){
		return new Atom(this.value + next , 1);
	}.bind(this);
}

Atom.prototype.mul = function() {
	var self = this.value;
	return function(next){
		return new Atom(this.value * next, 1);
	}.bind(this);
}

Atom.prototype.sub = function() {
	return function(next){
		return new Atom(this.value - next , 1);
	}.bind(this);
}

/**function Runtime(){
	this.bindings = {};
	this.defineFn= function (name, fn ){
		this.bindings[name] = fn;
	};
	this.get = function(name){
		return this.bindings[name];
	}
}**/

Atom.prototype.plusOne = function(){
	var ast = read("n.add.1");
	console.log(this.value);
	return evalWithEnv(ast, new ENV(undefined, {n : this.value})); //with n resolved how??
}