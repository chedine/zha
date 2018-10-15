

function read(src) {
    const lines = src.split("\n");
    const tokens = [];
    for (var i = 0; i < lines.length; i++) {
        const words = lines[i].split(" ");
        for (var k = 0; k < words.length; k++) {
            if (words[k].trim().length > 0) {
                tokens.push(_typeIfy(words[k]));
            }
        }
    }
    return tokens;
}

function _eval(ast) {
    let _stack = [];
    for (var i = 0; i < ast.length; i++) {
        _stack.push(ast[i]);
    }
    return _stack[0];
}

function parse(tokens) {
    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i] instanceof ZhaKeyword) {
            if (tokens[i].value === '=') {
                const ast = new Assignment(tokens.slice(0, i), tokens.slice(i + 1));
            }
        }
    }
}
class ZhaAst {

}
class Assignment extends ZhaAst {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;

    }
    do() {
        rt[this.left.value] = this.right.value;
    }
}

function read1(program) {
    //const ast = baseAST;
    let buf = '';
    let readingQuotes = false;
    let i = 0;
    let ast = [];
    //let expanded = [];
    
    for (i ; i < program.trim().length; i++) {
        var ch = program.charAt(i);
        if (ch === ' ') {
            if (buf.trim().length > 0) {
                ast.push(buf);
                buf = '';
            }
        }
        else {
            buf = buf + ch;
        }

        if(i === (program.length-1)){
            if(buf.trim().length> 0)
                ast.push(buf);
        }
    
    }
    return ast;
}

function macro_EQ(ast, pos) {
    const pre = ast.slice(0, pos);
    const post = ast.slice(pos+1);
    let m_ast = ["def"].concat(pre).concat(post);
    return read_expand(m_ast, pos);
}

function macro_Hash(ast, pos) {
    const pre = ast.slice(0, pos);
    const post = ast.slice(pos+1);
    let params;
    if (pre.length > 2) {
        params = pre.slice(2);
    }
    const fnVarDef = pre.slice(0,2);
    const m_ast =  fnVarDef.concat([["fn" , params, read_expand(post, 0)]]);
    return m_ast;
}
/**
 * 
 * 
function macro_EQ(ast, pos) {
    const tillEq = ast.slice(0, pos);
    let m_ast = ["def"].concat(tillEq);
    return [m_ast,pos+1];
}

function macro_Hash(ast, pos) {
    const ast_pre = ast.slice(0, pos);
    let params;
    if (ast_pre.length === 2) {
        //(def varname) form
        params = [];
    } else {
        params = ast.slice(2);
    }
    const ast_post = ast.slice(pos);
    return ast.slice(0, pos).concat([["fn", params, ast_post]]);
}
 */
const macros = {
    "=" : macro_EQ, "#" : macro_Hash
}

function read_expand(ast, start){
    let i = start !== undefined ? start : 0;

    for(i;i<ast.length;i++){
        const token = ast[i];
        const macro = macros[token];
        if(macro){
           return macro(ast, i);
        }
    }
    return ast[0];
}