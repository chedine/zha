
/**
 * 
 */
Zha.Component = class {

    constructor(config) {
        if (!config) {
            throw new Error("Missing config to instantiate Component")
        }
        this.config = config;
        this.code = config.code;
    }

    compute(inputs, env) {
        const fnEnv = new Zha.Env({}, Zha.RT);
        for (var i = 0; i < this.config.inputs.length; i++) {
            fnEnv.define(this.config.inputs[i], inputs[i]);
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

