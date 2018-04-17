function Symbol(token) {
	this.symbol = token;
	this.type = Array.isArray(token) ? 1 : 0;
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
	}
}

function Literal(val) {
	this.value = val;
	this.__lang = 'literal';
}

function isSymbol(target) {
	return target && target instanceof Symbol;
}

function isSplOp(target) {
	return target && target instanceof langOperator;
}

function isList(target) {
	return Array.isArray(target);
}

function isLiteral(target) {
	return target && target instanceof Literal;
}

function langOperator(token) {
	this.op = token;
	this.__lang = 'spl_op';
	this.isPipe = function () {
		return this.op === '|';
	}
	this.isEcho = function(){
		return this.op === '->';
	}
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


function read(program) {
	const ast = readExpr(program, 0, []);
	return ast;
}

function readExpr(program, startPos, baseAST) {
	const ast = baseAST;
	let buf = '';
	let readingQuotes = false;
	//Either add it to the topmost AST if we aren't reading a nested expr
	//Or add it to the current nested expr(AST)
	const addToAST = (token) => {
		if (token.length > 0) {
			ast.push(typeIfy(token));
		}
	}
	for (i = startPos; i < program.trim().length; i++) {
		const char = program.charAt(i);
		if (char === '"') {
			if (buf.length > 0) {
				if (readingQuotes) {
					addToAST(buf);
					buf = buf + '"';
					buf = '';
					readingQuotes = false;
				} else {
					console.log(`Error encountered quotes @ pos ${i} in ${program}`);
				}
			} else {
				readingQuotes = true;
				buf = buf + '"';
			}
		} else if (char === ' ') {
			if (!readingQuotes) {
				if (buf.trim().length > 0) {
					addToAST(buf);
					buf = '';
				}
			} else {
				buf = buf + char;
			}
		} else if (char === '(') {
			ast.push(readExpr(program, i + 1, []));
		} else if (char === ')') {
			addToAST(buf);
			buf = '';
			return ast;
		} else if (!readingQuotes &&
			char === '\r' || char === '\n' || char === '\r\n') {
			addToAST(buf);
			addToAST("\n");
			buf = '';
		} else {
			buf += char;
		}
	}
	if (buf.trim().length > 0) {
		addToAST(buf);
	}
	return ast;
}

function transform(actualAst) {
	var astChain = buildASTChain(actualAst);
	return astChain;
}
function buildASTChain(actualAst) {
	var ast = [];
	var currentAST = [];
	for (var i = 0; i < actualAst.length; i++) {
		var token = actualAst[i];
		if (isSplOp(token) && token.isPipe()) {
			ast.push(currentAST);
			currentAST = [];
		} else {
			currentAST.push(token);
		}
	}
	if (currentAST.length > 0) {
		ast.push(currentAST);
	}
	return ast;
}

function interpretAST(ast, env) {
	if (isList(ast)) {
		var evaled = [];
		for (var i = 0; i < ast.length; i++) {
			evaled.push(interpret(ast[i], env));
		}
		return evaled;
	} else {
		if (isLiteral(ast)) {
			return ast.value;
		} else if (isSymbol(ast)) {
			//Must be a symbol
			return env.lookup(ast.symbol);
		} else {
			//Cannot happen
			return ast;
		}
	}
}

function interpret(ast, env) {
	if (!isList(ast)) {
		return interpretAST(ast, env);
	} else {
		if (ast.length === 0) {
			return ast;
		}
		else {
			var evaled = interpretAST(ast, env);
			var fn = evaled[0];
			//console.log("Applying ", evaled);
			return fn.apply(undefined, evaled.slice(1));
		}
	}
}

function evaluate(ast, env, startValue) {
	var result = startValue;
	for (i = 0; i < ast.length; i++) {
		//Each el must be a list
		//Program ast is a list of list
		var currentAST = ast[i];
		if (i > 0 || result) {
			currentAST.push(result);
		}
		result = interpret(currentAST, env);
	}
	return result;
}