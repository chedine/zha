
var _Zha$ =function types(){
	var _self = this;
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
	class ZhaFn extends ZhaVal{
		constructor(fn){
			super(val);
			this._meta = {type:5};
		}
		invoke(env, args){
			var returnVal = this.value.apply(undefined,[env,args]);
			return returnVal;
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
			return mori.nth(this.value,i);
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
		ZhaBoolean: ZhaBoolean,
		ZhaNumber: ZhaNumber,
		ZhaString: ZhaString,
		ZhaList: ZhaList,
		ZhaVec: ZhaVec,
		ZhaRange: ZhaRange
	}
}();