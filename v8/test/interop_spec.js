InteropSpec = function() {
    var eval = Zha.Eval.eval;
    var read = Zha.Reader.read;

    interopTests = function(assert) {
        const evalAtom = (src) => {
            const ast = read(src).first();
            const result = eval(ast);
            return result;
        }

        assert.equal(evalAtom('js/g `document'), document, "A DOM");
        assert.equal(evalAtom('new `Zha.Number 5').value, 5, "constructs a js type");
        assert.equal(evalAtom('jp! 5 `value'), 5, "access value prop from js obj");
        assert.equal(evalAtom('jp! (jpset! 5 `value 10) `value'), 10, "access value prop from js obj");
        assert.equal(evalAtom('jc! `window.alert "hello there" '), undefined, "A DOM");

    }


    return [
        "Interop with JS and Zha is seamless", interopTests
    ];
}();