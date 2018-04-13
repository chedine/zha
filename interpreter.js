function Symbol(token){
	this.symbol = token;
	this.type = Array.isArray(token) ? 1: 0;
	this.__lang = 'symbol';
	this.isList = function(){
		return this.type === 1;
	}
	this.isSymbol = function(){
		return this.type === 0;
	}
}

function ENV(rt, env){
	this.env = env;
	this.root = rt;
	this.lookup = function(symbol){
		var key = symbol;
		var value;
		if(this.env.hasOwnProperty(key)){
			value = this.env[key];
		}
		else if(this.root){
			value = this.root.lookup(symbol);
		}
		else{
			console.error(key +" not available in environment");
			//TODO : Fix by raising error.
			//return undefined;
		}
		if(isSymbol(value)){
			return this.lookup(value);
		} 
		else{
			return value;
		}
	}
}
function Literal(val){
	this.value = val;
	this.__lang = 'literal';
}

function isSymbol(target){
	return target && target instanceof Symbol;
}

function isList(target){
	return Array.isArray(target);
}
function isLiteral(target){
	return target && target instanceof Literal;
}

function interpretAST(ast , env){
	if(isList(ast)){
		var evaled = [];
		for(var i=0;i<ast.length;i++){
			evaled.push(interpret(ast[i],env));
		}
		return evaled;
	}
	else{
		if(isLiteral(ast)){
			return ast.value;
		}
		else if(isSymbol(ast)){
			//Must be a symbol
			return env.lookup(ast.symbol);
		}
		else{
			//Cannot happen
			return ast;
		}
	}
}

function interpret(ast, env){
	if(!isList(ast)){
		return interpretAST(ast,env);
	}
	else{
		if(ast.length === 0){
			return ast;
		}
		else{
			var evaled = interpretAST(ast,env);
			var fn = evaled[0];
			console.log("Applying ", evaled);
			return fn.apply(undefined , evaled.slice(1));
		}
	}
}