var Zha = Zha || {};
; (function (zha, undefined) {
    zha.read = zha.Reader.read;
    zha.eval = function(codeStr, runtime){
        const ast = zha.read(codeStr);
        const results = [];
        for(var i=0;i<ast.length;i++){
            results.push(zha.Eval.eval(ast.get(i), runtime));
        }
        return results;
    }

})(window.Zha = window.Zha || {});