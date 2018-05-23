function read(program) {
	const ast = readExpr(program, 0, new ZhaList([]));
	return ast;
}

function readExpr(program, startPos, ast) {
	i = startPos;
	let readingQuotes = false,
		readingBraces = false;
	var tokens = [];
	var token = '';
	for (i = startPos; i < program.trim().length; i++) {
		const char = program.charAt(i);
		if (char === '"') {
			readingQuotes = !readingQuotes;
			token = token + char;
		} else if (char === '[') {
			readingBraces = true;
		} else if (char === ']') {
			readingBraces = false;
		} else if (char === '.' || char === ' ' || char === '\t' || char === '\n' || char === '\r') {
			if (!readingQuotes && !readingBraces) {
				tokens.push(tokenize(token))
				token = '';
			}
		} else {
			token = token + char;
		}
	}
	if (token.trim().length > 0) {
		tokens.push(tokenize(token))
	}
	return tokens;
}

function tokenize(token) {
	return typeIfy(token);
}

var sample_env = new ENV(undefined, {
	'a': 10,
	'n': 100,
	's': "dinesh"
});

var defaultENV = new ENV(undefined, {});

function eval(ast) {
	evalWithEnv(ast, undefined);
}

function evalWithEnv(ast, env){
	var _val = ast[0];
	var val = env !== undefined && isSymbol(_val) && env.isPresent(_val.value) ? typeIfy(env.lookup(_val.value)) : _val; //note, value is typeified.

	for (var i = 1; i < ast.length; i++) {
		let operand = env !== undefined && isSymbol(ast[i]) && env.isPresent(ast[i].value) ? env.lookup(ast[i].value) : ast[i].value;
		if (typeof val === "function") {
			val = val(operand);
		} else {
			val = val[operand]();
		}

	}
	console.log(val);
	return val;
}