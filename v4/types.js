class ZhaLiteral {
	constructor(val){
		this.value = val;
	}
	toString(){
		return this.value;
	}
}
class ZhaNumber extends ZhaLiteral{
	constructor(val){
		super(val);
		this._meta = {type: 1};
	}
}
class ZhaString extends ZhaLiteral{
	constructor(val){
		super(val);
		this._meta = {type: 2};
	}
}
class ZhaBoolean extends ZhaLiteral{
	constructor(val){
		super(val);
		this._meta = {type: 3};
	}
}
class ZhaSymbol{
	constructor(val){
		this.value = val;
		this._meta = {type: 4};
	}
	toString(){
		return this.value;
	}
}