EvalSpec = function () {
    var eval = Zha.Eval.eval;
    var read = Zha.Reader.read;

    simpleEvalTests = function (assert) {
        const evalAtom = (src) => {
            const ast = read(src).first();
            const result = eval(ast);
            return result;
        }

        assert.equal(evalAtom('"Hello World!"').value, "Hello World!", "A string atom must eval to itself");
        assert.equal(evalAtom('5').value, 5, "A number atom must eval to itself");
        assert.equal(evalAtom('false').value, false, "A Bool atom must eval to itself");
    }

    simpleListForms = function (assert) {
        const evalAtom = (src) => {
            const ast = read(src).first();
            const result = eval(ast);
            return result;
        }

        assert.equal(evalAtom('(+ 5 6)').value, 11, "(+ 5 6) must eval to 11");
        assert.equal(evalAtom('(+ 5 (+ 7 1))').value, 13, "Operands as a list are expanded before application");
    }

    defFormTests = function(assert){
        const code = `
        a = 55
        (+ a a)
        b = + a a
        b
        c = + a b
        c
        `;
        const ast = read(code);
        eval(ast.first());
        var result = eval(ast.second());
        eval(ast.get(2));
        var resultOfB = eval(ast.get(3));

        eval(ast.get(4));
        var resultOfC = eval(ast.get(5));

        assert.equal(result.value, 110, "defined variable a must be accessible");
        assert.equal(resultOfB.value, 110, "defined variable a must be accessible");
        assert.equal(resultOfC.value, 165, "defined variable a must be accessible");
    }
    fnTests = function(assert) {
        const code = `
        (def plus (fn (a b) (+ a b)))
        plus 5 6
        `
        const ast = read(code);
        eval(ast.first());
        var result = eval(ast.second());
        assert.equal(result.value, 11, "define");
    }

    fnTests1 = function(assert) {
        const code = `
        plus a b = + a b
        plus 5 6
        `
        const ast = read(code);
        eval(ast.first());
        var result = eval(ast.second());
        assert.equal(result.value, 11, "define");
    }

    function simpleConditionalTest(assert) {
        var code = 'if true "this is true" "this is false"';
        var ast = read(code);
        assert.equal(eval(ast.first()) , "this is true", "Must be true");
        code = 'if false "this is true" "this is false"';
        ast = read(code);
        assert.equal(eval(ast.first()) , "this is false", "Must be false");

        code = 'if false "this is true"';
        var ast = read(code);
        assert.equal(eval(ast.first()).value , null, "Must be null");
    }

    function simpleBlockTest(assert){
        var code = `
            equation a x b y = [
                ax = * a x
                by = * b y
                + ax by
            ]
            equation 1 2 3 4
        `;
        var ast = read(code);
        eval(ast.first());
        var result = eval(ast.second());
        assert.equal(result.value , 14, "must equate to 14")
    }
    function simpleLoopTest(assert){
        var code = `
        map seq f = loop seq (conj $state (f $val))
        my-list = list 1 2 3 4
        map my-list inc
        `;
        var ast = read(code);
        eval(ast.first());
        eval(ast.second());
        var result = eval(ast.get(2));
        assert.equal(result[0] , 2, "Must be 2");
    }
    function hmapTest(assert){
        var code = `
        my-map = {
            :k1 "dinesh"
            :k2 5
            :k3 (+ 5 5)
        }
        my-map
        :k1 my-map
        `;
        var ast = read(code);
        eval(ast.first());
        var result = eval(ast.second());
        assert.equal(result.count().value , 3, "Must have 3 keys");
        assert.equal(result.get(new Zha.Symbol(":k3")).value, 10);
        result = eval(ast.get(2));
        assert.equal(result.value , "dinesh", "Must be dinesh");
    
    }
    function playground(assert){
        var code = `
        my-comp = #{
            :k1 "dinesh"
            :k2 5
            :k3 (+ 5 5)
        }
        :k1 my-comp
        `;
        var ast = read(code);
        eval(ast.first());
        var result = eval(ast.second());
        assert.equal(result.value , "dinesh", "Must equal dinesh");
    }
    return [
        "Atoms eval to itself", simpleEvalTests,
         "List forms are treated as fn applications" , simpleListForms,
        "def form defines a binding in current env" , defFormTests,
        "def fn defines a new function" , fnTests,
        "new function" , fnTests1,
        "if/else tests", simpleConditionalTest,
        "simple block tests", simpleBlockTest,
       "Simple Looping construct tests", simpleLoopTest,
       "HashMap tests", hmapTest,
       /**"playground" , playground**/
    ];
}();