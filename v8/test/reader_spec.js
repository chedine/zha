ReaderSpec = function () {

    const read = Zha.Reader.read;

    const ASTUtil = function(ast){
        this.ast = ast;
        this.firstForm = function(){
            return this.ast[0];
        }
        this.nthForm = function(n){
            return this.ast[n-1];
        }
        this.nthToken = function(formIdx, tokenIdx){
            return this.ast[formIdx-1][tokenIdx-1];
        }
    }
    oneLineListTests = function (assert) {
        let ast = new ASTUtil(read("add x y"));

        assert.equal(ast.firstForm().length, 3, "<< add x y >> must return 3 forms");
        assert.equal(ast.nthToken(1,1) , "add", "First token must be add");

        ast = new ASTUtil(read("(add x y)"));
        assert.equal(ast.firstForm().length, 3, "<< (add x y) >> must return 3 forms");
        assert.equal(ast.nthToken(1,1),"add", "Passed!");

        ast = new ASTUtil(read("(1 2 3 5)"));
        assert.equal(ast.firstForm().length, 4, "[1 2 3 5] must be an arry of 4");
        assert.equal(ast.nthToken(1,4), 5, "Last token must be 5");

        ast = new ASTUtil(read("(1 2 3 5)"));
        assert.equal(ast.firstForm().length , 4, "(1 2 3 5) must be an arry of 4");
    }
    oneLineAtomTests = function (assert) {
        let ast = read("add").first();
        assert.equal(ast, "add", "Token must be add");

        ast = read("5").first();
        assert.equal(ast, 5, "Token must be 5");

        ast = read("  true ").first();
        assert.equal(ast, true, "Token must be true");

    }
    multiLineListTests = function (assert) {
        let code = `
    (add x y = + x y)
    (add 3 4)
    (both (= 5 5) false)
    (def calculus 
        (fn (a b x y)
            (let ((ax (mul a x)) 
                 (by (mul b y)))
            (add ax by))
        )
    )
    `;
        let ast = read(code);
        let aRealForm = ast[3];
        assert.equal(ast.length, 4, "4 forms expected");
        assert.equal(aRealForm.length, 3, "Its a list of 3");
        assert.equal(aRealForm[2].length, 3, "Its a list of 3");
        //Let form has three els.. let bindings expr
        assert.equal(aRealForm[2][2].length, 3, "Its a list of 3");
        //There are two bindings
        assert.equal(aRealForm[2][2][1].length, 2, "There must be 2 bindings");

    }
    unconventionalListTests = function (assert) {
        let code = `
        calculus a b x y = [
            ax = mul a x
            by = mul b y
            sum ax ay
        ]

        calculus 1 2 3 4

        map f seq = loop seq f
    `;
        let ast = read(code);
        assert.equal(ast.length, 3, "AST length with just one form");
        let calculusForm = ast.first();
        assert.equal(calculusForm.length, 3, "A fn declaration is always a list of 3");
        assert.equal(calculusForm.get(2).length, 3, "FN is made of 3 forms. fn, params,body");
    }
    emptyFileTests = function (assert) {
        let code = `




    
    `;
        let ast = read(code);
        assert.equal(ast.length, 0, "A file with just CRLF, Tabs and spaces shud have 0 forms");
    }
    mixedBagTests = function (assert) {
        let code = `
    calculus a b x y = [
        ax = mul a x
        by = mul b y
        sum ax ay
    ]

    (calculus 1 2 3 4)
    map f seq = loop seq f
    (def add (fn (x y) (+ x y)))
    `;
        let ast = read(code);
        assert.equal(ast.length, 4, "4 forms are expected");
        let calculusForm = ast.first();
        assert.equal(calculusForm.length, 3, "Its a list of 3 atoms");
        let lastForm = ast.get(2);
        assert.equal(lastForm.length, 3, "A std fn defn should have 3 forms")
    }
    assignMacrosTests = function(assert){
        let code = "age = 24";
        let ast = read(code).first();
        assert.equal(ast.length, 3, "name = value expands as a list of 3 forms")
        assert.equal(ast.first().value, "def", "name = value should expand as a def");
        assert.equal(ast.second().value, "age", "name = value should expand as a def");
        assert.equal(ast.get(2), 24, "name = value should expand as a def");

        code = "add x y = + x y";
        ast = read(code).first();
        assert.equal(ast.length, 3, "fn p1 p2 = body expands as a list of 3 forms")
        assert.equal(ast.first().value, "def", "First token must be def");
        assert.equal(ast.second().value, "add", "Second token must be the name of assignment var");
        const fn = ast.get(2);
        assert.equal(fn.length, 3, "A fn is always 3");
        assert.equal("fn", fn.first().value, "First token is fn");
        assert.equal(fn.second().length, 2, "Add fn has two params");
        assert.equal(fn.second().first().value, "x", "First param is x");
        assert.equal(fn.get(2).length, 3, "Fn body has three forms");
        assert.equal(fn.get(2).first().value, "+", "Add fn has two params");
    }
    nestedAssignMacrosTests = function(assert){
        let code = `
        calculus a b x y = [
            ax = mul a x
            by = mul b y
            sum ax ay
        ]`;
        const ast = read(code).first();   
        assert.equal(ast.length, 3, "fn p1 p2 = body expands as a list of 3 forms")
        assert.equal(ast.first().value, "def", "First token must be def");
        assert.equal(ast.second().value, "calculus", "Second token must be the name of assignment var");
        const fn = ast.get(2);
        assert.equal(fn.length, 3, "A fn is always 3");
        assert.equal("fn", fn.first().value, "First token is fn");
        assert.equal(fn.second().length, 4, "Calculus fn must have 4 params");
        assert.equal(fn.second().first().value, "a", "First param is a");
        assert.equal(fn.second().second().value, "b", "First param is a");

        const fnBody = fn.get(2);
        const bindings = fnBody.last();
        assert.equal(fnBody.length(), 3, "Body is a block having 3 lists");
        //assert.equal(bindings.first().value, "def", "Body is a block having 3 lists");
        assert.equal(bindings.length, 3, "Binding is a list of 3");
    }
    return [
        "One liner List forms", oneLineListTests,
        "One liner atoms", oneLineAtomTests,
        "Multi line std list forms", multiLineListTests,
        "Unconventional forms", unconventionalListTests,
        "An empty file", emptyFileTests,
        "Mixed bags", mixedBagTests,
        "Assignment macros" , assignMacrosTests,
        "Nested Assignment Macros" , nestedAssignMacrosTests
    ]

}();