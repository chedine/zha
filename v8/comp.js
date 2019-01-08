
/**
 * 
 */
Zha.Component = class {

    constructor(config) {
        if (!config) {
            throw new Error("Missing config to instantiate Component")
        }
        this.config = config;
        this.code = config.get("code");
		this.name = config.get("name");
		this.deps = initDependencies(config.get("deps"));
		this.inputs = config.get("in").value;
    }
	
	initDependencies(dependencyVector){
		const _depVector = dependencyVector.value;
		const deps = {};
		for(var i=0;i<_depVector.value.length;i=i+3){
			const dependencyName = _depVector[i+2].value;
			deps[dependencyName] = null; // load from ??
		}
		return deps;
	}
	
    compute(inputValues, env) {
        const fnEnv = new Zha.Env({}, Zha.RT);
        for (var i = 0; i < this.inputs.length; i++) {
            fnEnv.define(this.inputs[i], inputValues[i]);
        }
        return Zha.eval(this.code, fnEnv);
    }
}
/**
 * 
 */
Zha.ComponentGroup = class extends Zha.Component {

    constructor(config) {
        this.config = config;
        this.code = config.code;
    }

    compute(inputs, env) {
        return this.code.apply(undefined, inputs);
    }
}

