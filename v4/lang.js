//READER
function read(program) {
	/**
	 * Each valid form must be separated by ;
	 * Returns a list of lists. Each item in the return list represents a form.
	 */
    const asts = [];
    var i = 0;
    while(i < program.length){
    	var ast = [];
    	 i = read1(program, ast, i);
    	 asts.push(ast);
    }
    return asts;
}

function read1(program, collector, pos) {
    const addToken = token => {
        if (token.trim().length === 0) {
            return;
        }
        var typedToken = ZHATYPE.typeIfy(token.trim()); // token.trim(); //tokenize(token.trim());
        collector.push(typedToken);

    }
    let readingQuotes = false;
    let token = '';
    for (var i = (pos | 0); i < program.length; i++) {
        var char = program[i];
        if (char === '"') {
            readingQuotes = !readingQuotes;
            token = token + char;
            continue;
        }
        if (readingQuotes) {
            token = token + char;
        } else {
            if (char === '.' || char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                addToken(token);
                token = '';
            }
            else if (char === '(') {
                var innerCollector = [];
                var end = read1(program, innerCollector, i + 1);
                collector.push(innerCollector);
                i = end;
            } else if (char === ')') {
                addToken(token);
                return i;// + 1;
            } 
            else if (char === ',') {
            	if(token.trim().length >0){
            		addToken(token.trim());
            	}
                addToken(',');
                token = '';
            }
            else if (char === ';') {
                if(token.trim().length > 0){
                	addToken(token);
                }
                return i+1;
            } 
            else {
                token = token + char;
            }
        }
    }
    if (token.trim().length > 0) {
        addToken(token)
    }
    return i;
}
// PARSER
function parse(expr) {
	return parseExpr(expr, true);
}

function parseExpr(expr, topForm) {
	var ast = new Array(4);
	// Format: ["name", "paramvector", "bindings", "body"]
	ast[2] = []// bindings
	ast[3] = []; // body form

	for (var i = 0; i < expr.length; i++) {
		var token = expr[i];
		if (token.value === '=' && i > 0) {
			var defns = expr.slice(0, i);
			ast[0] = defns[0];
			if (defns.length > 1) {
				ast[1] = defns.slice(1);
			}
			ast[3] = [];
		} else if (token.value === 'where') {
			ast[2] = parseWhere(expr.slice(i + 1));
			break;
		} else {
			ast[3].push(token);
		}
	}

	return ast;
}

function parseWhere(whereExpr) {
	var bindings = [];
	var start = 0;
	/**
	 * Each binding is separated by a comma.
	 * When a comma is encountered we slice the elements visited so far and create an expression out of the binding.
	 * Accumulate all such bindings and return a list of all bindings.
	 */
	for (var i = 0; i < whereExpr.length; i++) {
		var token = whereExpr[i];
		if (token.value === ',') {
			var bindingDecl = whereExpr.slice(start, i);
			bindings.push(parseExpr(bindingDecl, false));
			start = i + 1; // +1 ignores the comma char/token
		}
	}
	bindings.push(parseExpr(whereExpr.slice(start, whereExpr.length), false));
	return bindings;
}

function printParsedExpr(parsed) {
	// Format: ["name", "paramvector", "bindings", "body"]
	var obj = {};
	if (parsed[0] !== undefined) {
		obj.name = parsed[0];
		if (parsed[1] !== undefined && parsed[1].length > 0) {
			obj.name += "[";
			for (var i = 0; i < parsed[1].length; i++) {
				obj.name += parsed[1][i];
				obj.name += " ";
			}
			obj.name += "]";
		}
	}

	if (parsed[2] !== undefined && parsed[2].length > 0) {
		obj.where = '';
		for (var i = 0; i < parsed[2].length; i++) {
			obj.where += printParsedExpr(parsed[2][i]);
			obj.where += " ";
		}
	}

	if (parsed[3] !== undefined && parsed[3].length > 0) {
		obj.body = '';
		for (var i = 0; i < parsed[3].length; i++) {
			obj.body += (parsed[3][i]);
			obj.body += " ";
		}
	}

	return JSON.stringify(obj);

}

function eval(src){
	var forms = read(src);
	var results = [];
	for(var i=0;i<forms.length; i++){
		var ast = parse(forms[i]);
		results.push(evalAST(ast , ENV));
	}
	return results;
}

// ------------- EVALUATOR ------------------------------------------------------------

function evalAST(ast, env){
	
	var bindings = ast[2];
	var name = ast[0];
	var params = ast[1];
	var isFn = name !== undefined && (params !== undefined && params.length > 0)
	if(!isFn){
		var lexScope = fixScope(bindings, env);
		var result =  evalForm(ast[3], lexScope);
		if(name !== undefined){
			//x = expr type
			//Eval expr and assign it to X
			env.define(name, result);
			return name;
		}
		else{
			// expr type
			//Just eval expr and return result
			return result;
		}
	}
}

function fixScope(bindings, env){
	/**
	 * For each binding. evaluate the body and create a closure over the base env.
	 */
	 var scope = new ENVIRONMENT({}, env);
	 for(var i=0; i< bindings.length;i++){
		 var name = bindings[i][0];
		// console.log("Fixing scope for ", name, bindings[i]);
		 var result = evalAST(bindings[i], scope);
		// scope.define(name, result);
	 }
	 return scope;
}

function evalForm(form, env){
//	var body = ast[3];
	if(!Array.isArray(form)){
		return evalAtom(form, env);
	}
	if(form.length === 1){
		return evalAtom(form[0], env);
	}
	else if(isSplDirective(form[0].value)){
		return evalSplDirective(form, env);
	}
	return evalFnApplication(form,env);
}

function isSplDirective(token){
	return token === "if";
}
function evalSplDirective(form,env){
	var directive = form[0];
	if(directive.value === 'if'){
		var predicate = evalForm(form[1],env);
		if(predicate.value === true){
			return evalForm(form[2], env);
		}else{
			return evalForm(form[3], env);
		}
	}
}
function evalFnApplication(form, env){
	var operation = form[0];
	var operands = form.slice(1);
	var args = [];
	for(var i=0;i<operands.length;i++){
		//TODO: Decide if pushing the raw value or ZHA type make sense
		//Right now, we push Zha type and let the function retrieve value from it.
		var val = operands[i]; //.value;
		if(ZHATYPE.isSymbol(val)){
			val = evalAtom(val, env);
		}else if(ZHATYPE.isList(val)){
			val = evalForm(val, env);
		}
		/**
		 * TODO: This arry type check should go away if we can have the AST type as ZhaList (like lisp's homoiconicity)
		 */
		else if(Array.isArray(val)){
			val = evalForm(val, env);
		}
		args.push(val);
	}
	var resolvedOP = env.lookup(operation);
	return resolvedOP.apply( undefined , args);
}

function evalAtom(atom, env){
	if(ZHATYPE.isSymbol(atom)){
		//TODO: This could be a function
		return env.lookup(atom);
	}
	return atom;
}