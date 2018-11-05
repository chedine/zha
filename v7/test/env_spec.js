EnvSpec = function (){
    var Env = Zha.Env;
    bindingsGetTests = function(assert){
        const testBindings = {
            "add" : "addsym",
            "5" : 5
        }
        const env = new ENVIRONMENT(testBindings, undefined);
        assert.equal(env.lookup(new Zha.Symbol("add")),"addsym", "Binding can be looked up using Zha Symbol");
        assert.equal(env.lookup(new Zha.Symbol("5")),5, "Binding can be looked up using Zha Symbol");
        assert.equal(env.lookup(new Zha.Symbol("missing")),undefined, "Binding can be looked up using Zha Symbol");

        env.define(new Zha.Symbol("test"), "A value");
        assert.equal(env.lookup(new Zha.Symbol("test")),"A value", "new binding can be added into an existing env");
    }
    nestedEnvTests = function(assert){
        const testBindings = {
            "add" : "addsym",
            "overwrite-me" : 55,
            "only-present-group1" : true
        }
        const env = new ENVIRONMENT(testBindings, undefined);

        const testBindings1 = {
            "add" : "add in group 2",
            "overwrite-me" : 56,
            "only-present-group2" : "group2"
        }
        const env1 = new ENVIRONMENT(testBindings1, env);

        const testBindings2 = {
            "add" : "add in group 3",
            "overwrite-me" : new Zha.Number(57)
        }
        const env2 = new ENVIRONMENT(testBindings2, env1);

        assert.equal(env2.lookup(new Zha.Symbol("add")),"add in group 3", "Values are fetched from the outermost env that has it");
        assert.equal(env2.lookup(new Zha.Symbol("overwrite-me")).value,57, "Outermost env can overwrite bindings in wrapped env");
        assert.equal(env2.lookup(new Zha.Symbol("only-present-group2")),"group2", "Falls back to the next higher env");
        assert.equal(env2.lookup(new Zha.Symbol("only-present-group1")),true, "Falls back to the next higher env");
        assert.equal(env2.lookup(new Zha.Symbol("not-present-anywhere")),undefined, "Returns undefined when not found anywhere");

    }
    return [
        "Bindings added to an env can be retrieved" , bindingsGetTests,
        "Nested Environments" , nestedEnvTests
    ];
}();