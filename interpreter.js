const _MACRO_CHARS = { "{":1 ,"}" : 1};

function read(program) {
	const ast = readExpr(program, 0, new ZhaList([]));
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
					buf = buf + '"';
					addToAST(buf);
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
			ast.push(readExpr(program, i + 1, new ZhaList([])));
		} else if (char === ')') {
			addToAST(buf);
			buf = '';
			return ast;
		} else if (!readingQuotes &&
			char === '\r' || char === '\n' || char === '\r\n') {
			addToAST(buf);
			//addToAST("\n");
			buf = '';
		}
		else if (char === '\t') {
			addToAST(buf);
			buf = '';
		} else {
			buf += char;
			if(_MACRO_CHARS[buf]){
				addToAST(buf);
				buf='';
			}
		}
	}
	if (buf.trim().length > 0) {
		addToAST(buf);
	}
	return ast;
}

function evalUnderEnv(ast, env) {
	if (isList(ast)) {
		return evalList(ast, env);
	} else if (isSymbol(ast)) {
		return env.lookup(ast.value);
	} else if (isLiteral(ast)) {
		return ast.value;
	} else {
		//Possible ???
		return ast;
	}
}

function evalList(list, env) {
	var first = list.first();
	if (isSymbol(first)) {
		if (first.value === 'def') {
			var binding = list.second();
			var expr = list.nth(2); //third
			var value = evalUnderEnv(expr, env);
			env.define(binding, value);
			return value;
		} else if (first.value === 'let') {
			//Let over form
			var bindings = list.second();
			var letBody = list.nth(2); //Third in the series
			var letOverEnv = new ENV(env, {});
			for (var i = 0; i < bindings.size(); i = i + 2) {
				letOverEnv.define(bindings.nth(i), evalUnderEnv(bindings.nth(i + 1), letOverEnv));
			}
			return evalUnderEnv(letBody, letOverEnv);
		} else if (first.value === 'fn') {
			var args = list.second();
			var fnBody = list.nth(2);
			return createFn(args, fnBody, env);
		} else {
			var resolvedSym = evalUnderEnv(first, env);
			return dispatch(resolvedSym, list.rest(), env);
		}

	} else if (isList(first)) {
		var result = evalList(first, env);
		var rest = list.rest();
		var expandedListForm = [];
		expandedListForm.push(result);
		for (var i = 0; i < rest.size(); i++) {
			expandedListForm.push(rest.nth(i));
		}
		return evalList(new ZhaList(expandedListForm), env);
	} else {
		return dispatch(first, list.rest(), env);
	}
}

function createFn(fnArgs, fnBody, currentEnv, prefilledArgs) {
	var fnImpl = new ZhaFn((params) => {
		if (params.size() === fnArgs.size()) {
			//all parameters supplied;
			//params is a ZhaList
			var fnEnv = new ENV(currentEnv, {});
			for (j = 0; j < params.size(); j++) {
				fnEnv.define(fnArgs.nth(j), params.nth(j));
			}
			return evalUnderEnv(fnBody, fnEnv);
		} else {
			//Not all args applied...Create partial application through closure
			return createPartialFn(fnArgs, fnBody, params, currentEnv);
		}
	}, true);

	return fnImpl;
}

function createPartialFn(fnArgs, fnBody, suppliedParams, currentEnv) {
	var partialEnv = new ENV(currentEnv, {});
	for (j = 0; j < suppliedParams.size(); j++) {
		partialEnv.define(fnArgs.nth(j), suppliedParams.nth(j));
	}
	var argsWaiting = fnArgs.value.slice(suppliedParams.size());
	return new ZhaFn((p) => {
		if (argsWaiting.length !== p.size()) {
			//More args to come...lets wait for them to be applied
			appliedParams = suppliedParams.value.concat(p.value);
			return createPartialFn(fnArgs,fnBody,new ZhaList(appliedParams), currentEnv);
		} else {
			for (j = 0; j < p.size(); j++) {
				partialEnv.define(argsWaiting[j], p.nth(j));
			}
			//console.log("Partial application ", partialEnv);
			return evalUnderEnv(fnBody, partialEnv);
		}
	}, true);
}

function dispatch(head, rest, env) {
	var evaled = new ZhaList(expandListform(rest, env));
	return head.invoke(evaled);
}

function expandListform(list, env) {
	var expandedForm = [];
	for (var i = 0; i < list.size(); i++) {
		expandedForm.push(evalUnderEnv(list.nth(i), env));
	}
	return expandedForm;
}

//Eval exist as a way to eval more than one exp
//useful for gulping a whole file.
function eval(ast) {
	var lastVal;
	var runtime = new ENV(undefined, rt);
	for (var i = 0; i < ast.size(); i++) {
		lastVal = evalExp(ast.nth(i), runtime);
	}
	
	return lastVal;
}

//Used for single expr
function evalExp(ast, env) {
	if(!env){
		env = new ENV(undefined, rt);
	}
	return evalUnderEnv(ast, env);
}