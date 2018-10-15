class ZhaVal {
	constructor(val) {
		this.value = val;
	}
}
class ZhaSymbol extends ZhaVal {
	constructor(val) {
		super(val);
		this._meta = { type: 4 };
	}
}
class ZhaKeyword extends ZhaVal {
	constructor(val) {
		super(val);
		this._meta = { type: 0 }
	}
}
class ZhaOperator extends ZhaVal {
	constructor(val) {
		super(val);
		this._meta = { type: 0 }
	}
}
class ZhaError {
	constructor(val) {
		this.value = val;
	}
}
class ZhaNil extends ZhaVal {
	constructor() {
		super(null);
	}
}

function _typeIfy(literal) {
	const keywords = "# { } looping = ( ) ; return";
	const ops = "+ - * / > < >= <= ! && ||";

	if (literal === "true" || literal === true) {
		return new Boolean(true);
	} else if (literal === "false" || literal === false) {
		return new Boolean(false);
	} else if (!isNaN(parseFloat(literal))) {
		return new Number(parseFloat(literal));
	} else if (literal.startsWith('"') && literal.endsWith('"')) {
		//Remove quotes
		return new String(literal.substring(1, literal.length - 1), 2);
		//return new String(literal.substring(1, literal.length - 1), 2);
	}
	else if (ops.indexOf(literal+" ") >= 0) {
		return new ZhaOperator(literal);
	}

	else if (keywords.indexOf(literal+" ") >= 0) {
		return new ZhaKeyword(literal);
	}
	else if(literal === ("nil")){
		return new ZhaNil();
	} 
	else {
		return new ZhaSymbol(literal);
	}
}
