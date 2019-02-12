'use strict';

function zha() {
    this.Reader = new Reader();
    this.ts = new ZhaType(this);
    this.Symbol = this.ts.Symbol;
    this.Block = this.ts.Block;
    this.Keyword = this.ts.Keyword;
    this.Fn = this.ts.Fn;
    const zhaEval = new Eval(this).eval;
    const _env = new Env(this);

    this.Env = _env.env;
    this.RT = new this.Env(_env.bindings, undefined);
    this.eval = function(codeStr, runtime) {
        const ast = this.Reader.read(codeStr);
        const results = [];
        for (var i = 0; i < ast.length; i++) {
            results.push(zhaEval(ast.get(i), runtime));
        }
        return results;
    }
    this.compiler = new ZhaCompiler();
}

const Zha = new zha();