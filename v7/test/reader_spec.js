ReaderSpec = function () {

    oneLineListTests = function (assert) {
        let ast = read("add x y")[0];
        assert.ok(ast.length === 3, "<< add x y >> must return 3 forms");
        assert.ok(ast[0] === "add", "First token must be add");

        ast = read("(add x y)")[0];
        assert.ok(ast.length === 3, "<< (add x y) >> must return 3 forms");
        assert.ok(ast[0] === "add", "Passed!");

        ast = read("[1 2 3 5]")[0];
        assert.ok(ast.length === 4, "[1 2 3 5] must be an arry of 4");
        assert.equal(ast[3], 5, "Last token must be 5");

        ast = read("(1 2 3 5)")[0];
        assert.ok(ast.length === 4, "(1 2 3 5) must be an arry of 4");
    }
    oneLineAtomTests = function (assert) {
        let ast = read("add")[0];
        assert.equal(ast, "add", "Token must be add");

        ast = read("5")[0];
        assert.equal(ast, 5, "Token must be 5");

        ast = read("  true ")[0];
        assert.equal(ast, "true", "Token must be true");

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
        let calculusForm = ast[0];
        assert.equal(calculusForm.length, 3, "A fn declaration is always a list of 3");
        assert.equal(calculusForm[2].length, 3, "FN is made of 3 forms. fn, params,body");
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
        let calculusForm = ast[0];
        assert.equal(calculusForm.length, 3, "Its a list of 3 atoms");
        let lastForm = ast[3];
        assert.equal(lastForm.length, 3, "A std fn defn should have 3 forms")
    }
    assignMacrosTests = function(assert){
        let code = "age = 24";
        let ast = read(code)[0];
        assert.equal(ast.length, 3, "name = value expands as a list of 3 forms")
        assert.equal(ast[0], "def", "name = value should expand as a def");
        assert.equal(ast[1], "age", "name = value should expand as a def");
        assert.equal(ast[2], 24, "name = value should expand as a def");

        code = "add x y = + x y";
        ast = read(code)[0];
        assert.equal(ast.length, 3, "fn p1 p2 = body expands as a list of 3 forms")
        assert.equal(ast[0], "def", "First token must be def");
        assert.equal(ast[1], "add", "Second token must be the name of assignment var");
        const fn = ast[2];
        assert.equal(fn.length, 3, "A fn is always 3");
        assert.equal("fn", fn[0], "First token is fn");
        assert.equal(fn[1].length, 2, "Add fn has two params");
        assert.equal(fn[1][0], "x", "First param is x");
        assert.equal(fn[2].length, 3, "Fn body has three forms");
        assert.equal(fn[2][0], "+", "Add fn has two params");
    }
    nestedAssignMacrosTests = function(assert){
        let code = `
        calculus a b x y = [
            ax = mul a x
            by = mul b y
            sum ax ay
        ]`;
        const ast = read(code)[0];   
        assert.equal(ast.length, 3, "fn p1 p2 = body expands as a list of 3 forms")
        assert.equal(ast[0], "def", "First token must be def");
        assert.equal(ast[1], "calculus", "Second token must be the name of assignment var");
        const fn = ast[2];
        assert.equal(fn.length, 3, "A fn is always 3");
        assert.equal("fn", fn[0], "First token is fn");
        assert.equal(fn[1].length, 4, "Calculus fn must have 4 params");
        assert.equal(fn[1][0], "a", "First param is a");
        assert.equal(fn[1][1], "b", "First param is a");

        const fnBody = fn[2];
        const firstBinding = fnBody[0][0];
        assert.equal(fnBody.length, 1, "Body is a block having 3 lists");
        assert.equal(firstBinding[0], "def", "Body is a block having 3 lists");
        assert.equal(firstBinding.length, 3, "Binding is a list of 3");
        assert.equal(firstBinding[2].length, 3, "Binding body is a list of 3");
        assert.equal(firstBinding[2][2], "x", "Binding body is mul a x");
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