function Symbol(token) {
	this.value = token;
	this.type = Array.isArray(token) ? 1 : 0;
	this.__lang = 'symbol';
	this.isList = function () {
		return this.type === 1;
	}
	this.isSymbol = function () {
		return this.type === 0;
	}
	this.toString = function(){
		return this.value;
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
	this.toString = function(){
		var str = "( ";
		for(var i=0;i<this.value.length;i++){
			str = str + this.value[i] + " ";
		}
		str = str +" ) ";
		return str;
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
	this.toString = function(){
		return "#fn";
	}
}
function Nothing(){
	this.__lang = "zha_nothing";
}

function Literal(val) {
	this.value = val;
	this.__lang = 'literal';
	this.toString = function(){
		return this.value;
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

function isLiteral(target) {
	return target && target instanceof Literal;
}

const typeIfy = function (literal) {
	if (literal === "|") {
		return new langOperator("|");
	}
	else if (literal === "->") {
		return new langOperator("->");
	}
	else if (literal === "true") {
		return new Literal(true);
	} else if (literal === "false") {
		return new Literal(false);
	} else if (!isNaN(parseFloat(literal))) {
		return new Literal(parseFloat(literal));
	} else if (literal.startsWith('"') && literal.endsWith('"')) {
		//Remove quotes
		return new Literal(literal.substring(1, literal.length - 1));
	} else {
		return new Symbol(literal);
	}
}
