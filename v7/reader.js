var Reader = Reader || {};

; (function (reader, undefined) {
    /**
     * Only public method of Zha.Reader
     * Reads the given source code string as AST (list)
     * You may or may not pass in the entire file contents into this read method, but
     * this method always assumes that the source string may have more than one forms
     * hence the return type is always a list (of asts)
     * @param {} code - String Text
     */
    reader.read = function read(code) {
        var tokens = tokenize(code);
        var reader = new SourceReader(tokens);
        return readAST(reader);
    }
    /**
     * The syntax is different from the LISP syntax. In a sense that not all forms
     * need to be enclosed in an explicit List form '()'.
     * When a line doesn't begin with a '(', we assume an implicit list unless the line ends with just one token.
     * EX 1:
     * sayHi => Is read as a just a token "sayHi"
     * add 1 3 => Is read as a (add 1 3)
     * @param {*} reader 
     */
    function readAST(reader) {
        var token = reader.peek();
        const allForms = [];
        while (token !== undefined) {
            const beginsAsListForm = token === '(' || token === '[';
            if (!beginsAsListForm) {
                const implicitListForm = [];
                if (token === '\n') {
                    reader.next();
                }
                else {
                    while (token !== undefined && token !== '\n') {
                        const form = readForm(reader);
                        implicitListForm.push(form);
                        token = reader.peek();
                    }
                    if (implicitListForm.length > 1) {
                        const expanded = new Zha.List(expandReaderMacros(implicitListForm));
                        allForms.push(expanded);
                    }
                    else if(implicitListForm.length >0){
                        allForms.push(implicitListForm[0]);
                    }
                }
            }
            else {
                const form = readForm(reader);
                allForms.push(form);
            }
            token = reader.peek();
        }
        return new Zha.List(allForms);
    }
    /**
     * Given a statefule Reader, We go through until the Reader is exhausted.
     * When the next token is '(' , we read what follows as a "List" until we encounter
     * a matching ')'
     * When the next token is '[' , we read what follows as a "Vector" until we encounter
     * a matching ']'
     * Otherwise, the token is read as just a token/form.
     */
    function readForm(reader) {
        var token = reader.peek();
        while (token !== undefined) {
            if (token === '(') {
                return readList(reader);
            }
            else if (token === '[') {
                return readBlock(reader);
            }
            else {
                //Atom
                const token = reader.next();
                return token === '\n' ? token : Zha.ts.typeIfy(token);
            }
        }
    }

    function readList(reader) {
        reader.next();// beginning of list. consume
        var token = reader.peek();
        var ast = [];
        while (token !== ')' && token !== undefined) {
            const form = readForm(reader);
            if (form !== '\n') {
                ast.push(form);
            }
            token = reader.peek();
        }
        if (token === ')') {
            reader.next();
        } else {
            throw new Error("Malformed List ");
        }
        return new Zha.List(expandReaderMacros(ast));
    }

    function readBlock(reader) {
        reader.next();// beginning of list block. consume
        var token = reader.peek();
        let ast = [];
        var currentLineAsAST = [];
        while (token !== ']' && token !== undefined) {
            const form = readForm(reader);
            if (form === '\n') {
                if (currentLineAsAST.length > 0) {
                    const expanded = new Zha.List(expandReaderMacros(currentLineAsAST));
                    ast.push(expanded);
                    currentLineAsAST = [];
                }
            } else {
                currentLineAsAST.push(form);
            }
            token = reader.peek();
        }
        if (token === ']') {
            if (currentLineAsAST.length > 0) {
                const expanded = expandReaderMacros(currentLineAsAST);
                if (ast.length > 0) {
                    ast.push(new Zha.List(expanded));
                }
                else {
                    ast = ast.concat(expanded)
                };
            }
            reader.next();
        } else {
            throw new Error("Malformed List block ");
        }
        return new Zha.Vec(ast);
    }

    function expandReaderMacros(listForm) {
        var expanded = [].concat(listForm);
        for (var i = 0; i < expanded.length; i++) {
            if (expanded[i].value === '=') {
                expanded = expandAssignment(expanded, i);
                i = -1;
            }
        }
        return expanded;
    }

    function expandAssignment(list, pos) {
        const beforeAssignment = list.slice(0, pos);
        const afterAssignment = list.slice(pos + 1, list.length);
        const params = beforeAssignment.slice(1);
        const def = new Zha.Symbol("def");
        if (params.length === 0) {
            let body = [def].concat(beforeAssignment);
            if (afterAssignment.length > 1 || Array.isArray(afterAssignment[0])) {
                body.push(afterAssignment);
            } else {
                body = body.concat(afterAssignment);
            }
            return body;
        } else {
            const fnName = beforeAssignment.slice(0, 1);
            const fnBody = [];
            fnBody.push(new Zha.Symbol("fn"));
            fnBody.push(params);
            fnBody.push(afterAssignment);
            return [def].concat(fnName).concat([fnBody]);
        }
    }

    function tokenize(program) {
        var ast = [];
        let readingQuotes = false;
        var buf = '';
        for (i = 0; i < program.length; i++) {
            var ch = program.charAt(i);
            if (ch === '"') {
                buf += '"';
                if (readingQuotes) {
                    ast.push(buf);
                    buf = '';
                    readingQuotes = false;
                }
                else {
                    readingQuotes = true;
                }
                continue;
            }
            if (readingQuotes) {
                buf += ch;
                continue;
            }
            if (ch === '#' || ch === '(' || ch === ')' || ch === '[' || ch === ']' || ch === '{' || ch === '}' || ch === '\n') {
                if (buf.length > 0) {
                    ast.push(buf);
                    buf = '';
                }
                ast.push(ch);
            }
            else if (ch === ' ' || ch === '\t') {
                if (buf.length > 0) {
                    ast.push(buf);
                    buf = '';
                }
            }
            else {
                buf = buf + ch;
            }
        }
        if (buf.trim().length > 0) {
            ast.push(buf);
        }
        // ast.push(EOF);
        return ast;
    }
    const EOF = -1;
    function SourceReader(tokens) {
        this.tokens = tokens.map(function (a) { return a; });
        this.position = 0;
    }
    SourceReader.prototype.next = function () { return this.tokens[this.position++]; }
    SourceReader.prototype.peek = function () { return this.tokens[this.position]; }
    SourceReader.prototype.peekAt = function (n) { return this.tokens[this.position + n]; }

})(Reader);
Zha.Reader = Reader;