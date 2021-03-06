'use strict';

const EOF = -1;

function Reader() {

    function SourceReader(tokens) {
        this.tokens = tokens.map(function (a) { return a; });
        this.position = 0;
    }
    SourceReader.prototype.next = function () { return this.tokens[this.position++]; }
    SourceReader.prototype.peek = function () { return this.tokens[this.position]; }
    SourceReader.prototype.peekAt = function (n) { return this.tokens[this.position + n]; }
    /**
     * Only public method of Zha.Reader.
     * Reads the given source code string as AST (list)
     * You may or may not pass in the entire file contents into this read method, but
     * this method always assumes that the source string may have more than one forms.
     * Hence the return type is always a list (of asts)
     * @param {} code - String Text
     */
    const read = function read(code) {
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
            const beginsAsListForm = token.val === '(' || token.val === '[';
            if (!beginsAsListForm) {
                const implicitListForm = [];
                if (token.val === '\n') {
                    reader.next();
                }
                else {
                    while (token !== undefined && token.val !== undefined && token.val !== '\n') {
                        const form = readForm(reader);
                        implicitListForm.push(form);
                        token = reader.peek();
                    }
                    if (implicitListForm.length > 1) {
                        const expanded = [].concat(expandReaderMacros(implicitListForm));
                        allForms.push(expanded);
                    }
                    else if (implicitListForm.length > 0) {
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
        return allForms; //new Array(allForms);
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
        while (token !== undefined && token.val !== undefined) {
            if (token.val === '(') {
                return readList(reader);
            }
            else if (token.val === '[') {
                return readBlock(reader);
            }
            else if (token.val === '{') {
                return readMap(reader);
            }
            else {
                //Atom
                const token = reader.next();
                return token.val === '\n' ? token.val : Zha.ts.typeIfy(token.val);
            }
        }
    }

    function readList(reader) {
        reader.next();// beginning of list. consume
        var token = reader.peek();
        var ast = [];
        while (token.val !== undefined && token.val !== ')') {
            const form = readForm(reader);
            if (form !== '\n') {
                ast.push(form);
            }
            token = reader.peek();
        }
        if (token && token.val === ')') {
            reader.next();
        } else {
            throw new Error("Malformed List ");
        }
        return [].concat(expandReaderMacros(ast));
    }

    function readMap(reader) {
        reader.next();// beginning of Map. consume
        var token = reader.peek();
        var ast = [];
        while (token !== undefined && token.val !== undefined && token.val !== '}') {
            const form = readForm(reader);
            if (form !== '\n') {
                ast.push(form);
            }
            token = reader.peek();
        }
        if (token.val === '}') {
            reader.next();
        } else {
            throw new Error("Malformed Map ");
        }
        var mapAST = [new Zha.Symbol("hashmap"), ...(expandReaderMacros(ast))];
        return (mapAST);
    }
    function readBlock(reader) {
        reader.next();// beginning of list block. consume
        var token = reader.peek();
        let ast = [];
        var currentLineAsAST = [];
        while (token !== undefined && token.val !== undefined && token.val !== ']') {
            const form = readForm(reader);
            if (form === '\n') {
                if (currentLineAsAST.length > 0) {
                    const expanded = (expandReaderMacros(currentLineAsAST));
                    ast.push(expanded);
                    currentLineAsAST = [];
                }
            } else {
                currentLineAsAST.push(form);
            }
            token = reader.peek();
        }
        if (token && token.val === ']') {
            if (currentLineAsAST.length > 0) {
                const expanded = expandReaderMacros(currentLineAsAST);
                if (ast.length > 0) {
                    ast.push((expanded));
                }
                else {
                    ast = ast.concat(expanded)
                };
            }
            reader.next();
        } else {
            throw new Error("Malformed List block ");
        }
        return new Zha.Block(ast);
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
        const afterAssignment = Array.isArray(list[pos + 1]) ? list[pos + 1] : list.slice(pos + 1, list.length);
        const params = beforeAssignment.slice(1);
        const def = new Zha.Symbol("def");
        if (params.length === 0) {
            let body = [def].concat(beforeAssignment);
            if (afterAssignment.length > 1) {
                body.push(afterAssignment);
            } else {
                body = body.concat(afterAssignment);
            }
            return body;
        } else {
            const fnName = beforeAssignment.slice(0, 1);
            const fnBody = [];
            fnBody.push(new Zha.Symbol("fn"));
            fnBody.push([].concat(params));
            var fnExpr;
            if (Zha.ts.isList(afterAssignment[0]) || Zha.ts.isBlock(afterAssignment[0])) {
                fnExpr = afterAssignment[0];
            } else {
                fnExpr = (afterAssignment);
            }
            fnBody.push(fnExpr);
            return [def].concat(fnName).concat(new Array(fnBody));
        }
    }

    function tokenize(program) {
        var ast = [];
        let readingQuotes = false;
        var buf = '';
        var lineCount = 1;
        var posAtLine = 0;
        const pushToAST = (token) => {
            ast.push({
                val: token,
                _meta: [lineCount, [(posAtLine - token.length), posAtLine]]
            });
        }
        for (var i = 0; i < program.length; i++) {
            var ch = program.charAt(i);
            if (ch === '\n') {
                lineCount++;
                posAtLine = 0;
            } else {
                posAtLine++;
            }
            if (ch === '"') {
                buf += '"';
                if (readingQuotes) {
                    pushToAST(buf);
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
                    pushToAST(buf);
                    buf = '';
                }
                pushToAST(ch);
            }
            else if (ch === ' ' || ch === '\t') {
                if (buf.length > 0) {
                    pushToAST(buf);
                    buf = '';
                }
            }
            else {
                buf = buf + ch;
            }
        }
        if (buf.trim().length > 0) {
            pushToAST(buf);
        }
        // ast.push(EOF);
        return ast;
    }

    return {
        read: read
    }

}

