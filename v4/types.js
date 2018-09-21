var _Zha$ =function types(){
	var _self = this;
	const _internals = Symbol('_internals');
	
	class ZhaVal{
		constructor(val){
			this.value = val;
		}
		toString(){
			return this.value;
		}
	}
	class ZhaLiteral extends ZhaVal{
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
	class ZhaSymbol extends ZhaVal{
		constructor(val){
			super(val);
			this._meta = {type: 4};
		}
		toString(){
			return this.value;
		}
	}
	class ZhaKeyword {
		constructor(val){
			this.value = val;
			this._meta = {type : 0}
		}
		toString(){
			return this.value;
		}
		equals(zhaVal){
			return this._meta.type === zhaVal._meta.type && this.value === zhaVal.value;
		}
	}
	class ZhaFn extends ZhaVal{
		constructor(fn,name, args, curried= false){
			super(fn);
			this._prefills = [];
			this._meta = {type:5, name: name, args: args,curried:curried};
		}
		invoke( arrayOfArgs, env){
			if(!this._meta.curried){
				var returnVal = this.value.apply(undefined,[arrayOfArgs,env]);
				return returnVal;
			}
			else{
				var isFulfilled  = this._prefills.length + arrayOfArgs.length === this._meta.args.length;
				if(isFulfilled){
					var fullArgsList = this._prefills.concat(arrayOfArgs);
					var returnVal = this.value.apply(undefined,[fullArgsList,env]);
					return returnVal;
				}
				else{
					const curried = new ZhaFn(this.value, this._meta.name, this._meta.args, true);
					curried._prefills.concat(this._prefills);
					for(var i=0;i<arrayOfArgs.length;i++){
						curried._prefills.push(arrayOfArgs[i]);	
					}
					return curried;
				}
			}
		}
	}
	class ZhaSeq extends ZhaVal{
		constructor(val){
			super(val);
		}
		conj(el){
			return this.make(mori.conj(this.value , el));
		}
		assoc(i, el){
			return this.make(mori.assoc(this.value, i , el));
		}
		get(i, defaultValue){
			//i is a ZhaVal
			return mori.get(this.value, i.value, defaultValue);
		}
		nth(i){
			return mori.nth(this.value,i.value);
		}
		last(){
			return mori.last(this.value)
		}
		trash(){
			return this.make(mori.empty(this.value));
		}
		count(){
			return new _Zha$.ZhaNumber(mori.count(this.value));
		}
		reverse(){
			return this.make(mori.reverse(this.value));
		}
		first(){
			return mori.first(this.value);
		}
		second(){
			return mori.nth(this.value,1);
		}
		third(){
			return mori.nth(this.value,2);
		}
		toString(){
			return mori.toJs(this.value);
		}
	}
	class ZhaList extends ZhaSeq{
		constructor(val){
			super(mori.isList(val)? val: mori.list.apply(undefined, val));
		}
		make(seq){
			return new ZhaList(seq);
		}
	}
	
	class ZhaVec extends ZhaSeq{
		constructor(val){
			super(mori.vector(val)? val: mori.vector.apply(undefined, val));
		}
		make(seq){
			return new ZhaVec(seq);
		}
	}
	
	class ZhaRange extends ZhaSeq{
		constructor(start, end, step){
			super();
			this.value = mori.range(start,end,step);
		}
		make(seq){
			return new ZhaRange(seq);
		}
	}
	return {
		isLiteral : (v) => v instanceof ZhaLiteral,
		isSeq : (v) => v instanceof ZhaSeq,
		isSymbol : (v) => v instanceof ZhaSymbol,
		isList : (v) => v instanceof ZhaList,
		isFn : (v) => v instanceof ZhaFn,
		isKeyword : (v) => v instanceof ZhaKeyword,
		ZhaBoolean: ZhaBoolean,
		ZhaNumber: ZhaNumber,
		ZhaString: ZhaString,
		ZhaList: ZhaList,
		ZhaVec: ZhaVec,
		ZhaRange: ZhaRange,
		ZhaSymbol:ZhaSymbol,
		ZhaFn:ZhaFn,
		ZhaKeyword:ZhaKeyword
	}
}();

function _typeIfy (literal) {
	if (literal === "true" ||  literal === true) {
		return new _Zha$.ZhaBoolean(true);
	} else if (literal === "false" || literal === false) {
		return new _Zha$.ZhaBoolean(false);
	} else if (!isNaN(parseFloat(literal))) {
		return new _Zha$.ZhaNumber(parseFloat(literal));
	} else if (literal.startsWith('"') && literal.endsWith('"')) {
		//Remove quotes
		return new _Zha$.ZhaString(literal.substring(1, literal.length - 1), 2);
	}
	else if(literal.startsWith(':')){
		return new _Zha$.ZhaKeyword(literal);
	} else {
		return new _Zha$.ZhaSymbol(literal);
	}
}
const curryz = f => {
    const aux = (n, xs) =>
        n === 0 ? f(...xs) : x => aux(n - 1, [...xs, x])
    return aux(f.length, [])
}