TypeSpec = function (){
    var typeify = Zha.ts.typeIfy;
    typeIfyTests = function(assert){
        
        assert.equal(true, Zha.ts.isString(typeify('"Zha"')), "Quoted literal must be a String");
        assert.equal(true, Zha.ts.isBool(typeify('true')), "Literal true must be a bool");
        assert.equal(true, Zha.ts.isBool(typeify('false')), "Literal false must be a bool");
        assert.equal(true, Zha.ts.isNumber(typeify('57')), "Literal 57 must be a number");
        assert.equal(true, Zha.ts.isNumber(typeify('57.896')), "Literal 57.896 must be a number");
        assert.equal(true, Zha.ts.isKeyword(typeify(':ASampleKey')), "Literal that starts with : must be a keyword");
        assert.equal(true, Zha.ts.isSymbol(typeify('ASampleKey')), "Must be a symbol");
    }
    AccessibleValues = function(assert){
        assert.equal(55, 55 , "Value can be accessed");
        assert.equal("Zha", "Zha" , "Value can be Zha");
        assert.equal(null, new Zha.Nil("Zha").value , "Value can only be null");
    }
    return [
        "Raw Text is typed by TS correctly" , typeIfyTests,
        "Raw values can be accessed " , AccessibleValues 
    ];
}();