

function read(program) {
	const ast = readExpr(program, 0, new ZhaList([]));
	return ast;
}

function readExpr(program, startPos, ast) {
	i = startPos;
	let readingQuotes = false, readingBraces= false;
	var tokens = [];
	var token = '';
	for (i = startPos; i < program.trim().length; i++) {
		const char = program.charAt(i);
		if(char === '"'){
			readingQuotes = !readingQuotes;
			token = token + char;
		}
		else if(char === '['){
			readingBraces = true;
		}
		else if(char === ']'){
			readingBraces = false;
		}
		else if(char === '.' || char === ' ' || char === '\t' || char === '\n' || char === '\r'){
			if(!readingQuotes && !readingBraces){
				tokens.push(tokenize(token))
				token = '';
			}
		}
		else{
			token = token + char;
		}
	}
	if (token.trim().length > 0) {
		tokens.push(tokenize(token))
	}
	return tokens;
}

function tokenize(token){
	return typeIfy(token);
}

function eval(ast){
	
	var val = ast[0];
	for(var i=1;i<ast.length;i++){
		if(typeof val === "function"){
			val = val(ast[i].value);
		}
		else{
			val = val[ast[i].value]();	
		}
		
	}
	console.log(val);
}