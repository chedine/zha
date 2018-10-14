var ZhaFns = `
type val    = js/call val "type";
checkType val target = js/call t "equals" target where t = type val;
number? val = checkType val :Number;
string? val = checkType val :String;
vec? val = checkType val :Vector;
list? val = checkType val :Vector;
fn? val = checkType val :Fn;
afn? val = checkType val :AFn;
map? val = checkType val :Map;
empty? val = eq (count val) 0;
nil? val = eq val nil;

+ n1 n2     = js/call n1 "add" n2;
- n1 n2     = js/call n1 "sub" n2;
* n1 n2     = js/call n1 "mul" n2;
/ n1 n2     = js/call n1 "div" n2;
% n1 n2     = js/call n1 "mod" n2;
even? n     = if (eq (% n 2) 0) true false;
odd?  n     = if (noteq (% n 2) 0) true false;

&& n1 n2     = js/call n1 "and" n2;
|| n1 n2     = js/call n1 "or" n2;
! n1 n2     = js/call n1 "not" n2;

map    transform lst = last (loop lst t1 empty) where t1 item state = conj state (transform item), empty = [];
filter predicate lst = last (loop lst t1 empty) where t1 item state = if (predicate item) (conj state item) state , empty = [];
reduce reducer initial lst = last (loop lst t1 initial) where t1 item state = reducer item state;
flatten lst = last (loop lst t1 []) where t1 item state = if (vec? item) (concat state item) (conj state item);

identity x = x;
echo x = x;
inc x = + x 1;
dec x = - x 1;
true? x = eq x true;
false? x = eq x false;

toUpper str   = ->Str (js/call s "toUpperCase") where s = js/prop str "value";
toLower str   = ->Str (js/call s "toLowerCase") where s = js/prop str "value";
substr str frm = ->Str (js/call s "substr" frm) where s = js/prop str "value";
count seq     = js/call seq "count";
last seq      = js/call seq "last";
first seq     = js/call seq "first";
nth seq index = js/call seq "nth" index;
second seq    = js/call seq "second";
third seq     = js/call seq "third";
rest seq      = js/call seq "rest";
take n seq   = js/call seq "take" n;
takeLast n seq  = js/call seq "takeLast" n;
takeFrom start n seq = js/call seq "takeFrom" start n;
drop n seq    = js/call seq "drop" n;
get seq index = js/call seq "get" index;
conj seq el   = js/call seq "conj" el;
concat seq seq2 = js/call seq "concat" seq2;
assoc seq i val = js/call seq "assoc" i val;

constantly  x = #  x;

compose f1 f2    = # (...args) (f2 (apply f1 args));
both pred1 pred2 = # (...args) (&& (apply pred1 args) (apply pred2 args));
or pred1 pred2   = # (...args) (|| (apply pred1 args) (apply pred2 args));
complement pred  = # (...args) (! (apply pred args));

when pred handler = # (...args) (if (apply pred args) (apply handler args));

pipe fnlist = # (...val) (last (loop fnlist chain val)) 
    where chain fn state = apply fn state;

ap fnlist valueList = last (loop fnlist mapOver empty) where mapOver f state = concat state (map f valueList) , empty = (call list);

applyTo val = # (f) (f val);
flip fn = # (...args) (fn (second args) (first args)); 
of val = (list val);
pair first second = (list first second);
Truthy = # () true;
Falsey = # () false;

find predicate lst      = first (filter predicate lst);
findLast predicate lst  = last (filter predicate lst);
findNth predicate n lst = nth (filter predicate lst) n;
times fn end = map fn (range 0 end);

partition-by f coll = second (last (loop coll t1 (pair nil [])) )
 where 
  t1 item state       = if (isSameAsLast state (f item)) 
                            (pair (f item) (append (second state) item)) 
                            (pair (f item) (append (second state) [item])),
  isSameAsLast pstate v = if (eq (first pstate) v) true false,
  append seq item = if (empty? seq) (conj seq item ) (if (list? (last seq)) (assoc seq (dec (count (last seq))) (conj (last seq) item)) (conj seq item) );

every? f coll = testFrom 0 where 
 testFrom n = if (false? (f (nthItem n))) false (if (exhausted? n) true (testFrom (inc n))), 
 exhausted? n1 = if (eq n1 sizeMinusOne) true false,
 sizeMinusOne = dec (count coll),
 nthItem = (curry nth) coll;
 
any? f coll = testFrom 0 where 
 testFrom n = if (true? (f (nthItem n))) true (if (exhausted? n) false (testFrom (inc n))), 
 exhausted? n1 = if (eq n1 sizeMinusOne) true false,
 sizeMinusOne = dec (count coll),
 nthItem = (curry nth) coll;

split str delim = js/call str "split" delim;
match str regex = js/call str "match" regex;
__nativeStrFn val fn = ->Str (js/call (js/prop val "value") fn);
trim str = __nativeStrFn str "trim";
trimLeft str = __nativeStrFn str "trimLeft";
trimRight str = __nativeStrFn str "trimRight";

aperture n _seq = startTakingInto 0 [] where 
 startTakingInto start list = if (exhausted? start) list (startTakingInto (inc start) (conj list (takeFrom start n _seq))) , 
 exhausted? n1 = if (> (+ n n1) (count _seq)) true false;

tap fn = # (val) (if (ignoreMe (fn val)) val val) where ignoreMe v = true;

tapLog = tap log;

cond conditions = # (...args) (evalNth 0 (first conditions) args) where 
 evalNth n conditional args = if (exhausted? n) 
                              "nothing"
                              (if (apply (first conditional) args) 
                                (if (fn? (second conditional)) (apply (second conditional) args) (second conditional))
                                (evalNth (inc n) (nth conditions (inc n)) args)),
 exhausted? n1 = if (eq n1 size) true false,
 size = count conditions;

`;

var samples = `
add x y = + x y;
mylist = list 1 2 3 4 5 6;
same = compose inc dec;
gt10 n = > n 10;
lt50 n = < n 50;
bw10&50 = both gt10 lt50;
notBw10 = complement bw10&50;
map inc mylist;
match "aasdf" "/([a-z]a)/g"
`;