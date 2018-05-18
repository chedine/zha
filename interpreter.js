const _MACRO_CHARS = {
	"{": 1,
	"}": 1
};

function read(program) {
	const ast = readExpr(program, 0, new ZhaList([]));
	return ast;
}
function readMacro(program, currentPos, astSoFar){
	var form = (readExpr(program, currentPos + 1, new ZhaList([])));
	var listForm = form.first();
	var intercepted = [new Symbol("list")].concat(listForm.value);
	astSoFar.push(new ZhaList(intercepted));
}

function isReaderMacro(token){
	return token === "`";
}

function readExpr(program, startPos, ast) {
	//const ast = baseAST;
	let buf = '';
	let readingQuotes = false;
	i = startPos;

	const addToAST = (token) => {
		if (token.length > 0) {
			if(isReaderMacro(token)){
				console.log("Reader macro : ", token);
				readMacro(program, i , ast);
			}
			else{
				ast.push(typeIfy(token));
			}
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
		} else if (char === '\t') {
			addToAST(buf);
			buf = '';
		} else {
			buf += char;
			if (_MACRO_CHARS[buf]) {
				addToAST(buf);
				buf = '';
			}
		}
	}
	if (buf.trim().length > 0) {
		addToAST(buf);
	}
	return ast;
}

function isMacroCall(ast, env) {
	if(!isList(ast) || !isSymbol(ast.first())){
		return false;
	}
	var present = env.isPresent(ast.first().value);
    return present && env.lookup(ast.first().value).isMacro;
}

async function macroExpand(ast, env){
	if(!isMacroCall(ast, env)){
		return ast;
	}
	var macroExpander = env.lookup(ast.first().value);
	var expandedForm = await macroExpander.invoke(ast.rest());
	console.log("Expanded as ", expandedForm);
	return expandedForm;
}

async function evalUnderEnv(ast, env) {
	if (isList(ast)) {
		return await evalList(ast, env);
	} else if (isSymbol(ast)) {
		return env.lookup(ast.value);
	} else if (isLiteral(ast)) {
		return ast.value;
	} else {
		//Possible ???
		return ast;
	}
}

async function evalList(list, env) {
	var list = await macroExpand(list, env);
	var first = list.first();
	if (isSymbol(first)) {
		if (first.value === 'def') {
			var binding = list.second();
			var expr = list.nth(2); //third
			var value = await evalUnderEnv(expr, env);
			env.define(binding, value);
			return value;
		} else if (first.value === 'defmacro') {
			var binding = list.second();
			var expr = list.nth(2);
			var value = createMacroFn(expr, env);
			env.define(binding, value);
			return value;
		} else if (first.value === 'let') {
			//Let over form
			var bindings = list.second();
			var letBody = list.nth(2); //Third in the series
			var letOverEnv = new ENV(env, {});
			for (var i = 0; i < bindings.size(); i = i + 2) {
				letOverEnv.define(bindings.nth(i), await evalUnderEnv(bindings.nth(i + 1), letOverEnv));
			}
			return await evalUnderEnv(letBody, letOverEnv);
		} else if (first.value === 'fn') {
			var args = list.second();
			var fnBody = list.nth(2);
			return createFn(args, fnBody, env);
		} else {
			var resolvedSym = await evalUnderEnv(first, env);
			return await dispatch(resolvedSym, list.rest(), env);
		}

	} else if (isList(first)) {
		var result = await evalList(first, env);
		var rest = list.rest();
		var expandedListForm = [];
		expandedListForm.push(result);
		for (var i = 0; i < rest.size(); i++) {
			expandedListForm.push(rest.nth(i));
		}
		return await evalList(new ZhaList(expandedListForm), env);
	} else {
		return await dispatch(first, list.rest(), env);
	}
}

function createMacroFn(fnBody, currentEnv) {
	var fnImpl = new ZhaFn((params) => {
		//For now macros have an implict argument called ast.
		//Which is set to the ast to be expanded...
		var fnEnv = new ENV(currentEnv, {});
		fnEnv.define(new Symbol("ast"), params);
		return evalUnderEnv(fnBody, fnEnv);
	}, false);
	fnImpl.isMacro = true;
	return fnImpl;
}

function createFn(fnArgs, fnBody, currentEnv, prefilledArgs) {
	var fnImpl = new ZhaFn((params) => {
		if (params && params.size() === fnArgs.size()) {
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
			return createPartialFn(fnArgs, fnBody, new ZhaList(appliedParams), currentEnv);
		} else {
			for (j = 0; j < p.size(); j++) {
				partialEnv.define(argsWaiting[j], p.nth(j));
			}
			//console.log("Partial application ", partialEnv);
			return evalUnderEnv(fnBody, partialEnv);
		}
	}, true);
}

async function dispatch(head, rest, env) {
	var evaled = new ZhaList(await expandListform(rest, env));
	//head is a ZhaFn
	var results = await head.invoke(evaled);
	return results;
}

async function expandListform(list, env) {
	var expandedForm = [];
	for (var i = 0; i < list.size(); i++) {
		expandedForm.push(await evalUnderEnv(list.nth(i), env));
	}
	return expandedForm;
}

//Eval exist as a way to eval more than one exp
//useful for gulping a whole file.
async function eval(ast) {
	var lastVal;
	var runtime = new ENV(undefined, rt);
	for (var i = 0; i < ast.size(); i++) {
		lastVal = await evalExp(ast.nth(i), runtime);
	}

	return lastVal;
}

//Used for single expr
async function evalExp(ast, env) {
	if (!env) {
		env = new ENV(undefined, rt);
	}
	return await evalUnderEnv(ast, env);
}