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
    return [
        "Atoms eval to itself", simpleEvalTests
    ];
}();