var ZhaFns = `
+ n1 n2     = js/call n1 "add" n2;
- n1 n2     = js/call n1 "sub" n2;
* n1 n2     = js/call n1 "mul" n2;
/ n1 n2     = js/call n1 "div" n2;
% n1 n2     = js/call n1 "mod" n2;

&& n1 n2     = js/call n1 "and" n2;
|| n1 n2     = js/call n1 "or" n2;
! n1 n2     = js/call n1 "not" n2;

list1 args = js/new "_Zha$.ZhaVec" args;

map transform lst = last (loop lst t1 empty) where t1 item state = conj state (transform item), empty = (call list);
identity x = x;
echo x = x;
inc x = + x 1;
dec x = - x 1;
fargs fn = apply list (js/prop (js/prop fn "_meta") "args");

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
take seq n    = js/call seq "take" n;
takeLast seq n  = js/call seq "takeLast" n;
drop seq n    = js/call seq "drop" n;
get seq index = js/call seq "get" index;
conj seq el   = js/call seq "conj" el;
concat seq seq2 = js/call seq "concat" seq2;

constantly  x = #  x;

compose f1 f2    = # (...args) (f2 (apply f1 args));
both pred1 pred2 = # (...args) (&& (apply pred1 args) (apply pred2 args));
or pred1 pred2   = # (...args) (|| (apply pred1 args) (apply pred2 args));
complement pred  = # (...args) (! (apply pred args));

when pred handler = # (...args) (if (apply pred args) (apply handler args));

pipe fnlist = # (...val) (last (loop fnlist chain val)) 
    where chain fn state = apply fn state;

ap fnlist valueList = last (loop fnlist mapOver empty) where mapOver f state = concat state (map f valueList) , empty = (call list);
curry1 fn = # (...val) (total) where args = fargs fn , total = + (count val) (count args) ;

applyTo val = # (f) (f val);
flip fn = # (...args) (fn (second args) (first args)); 
of val = (list val);
pair first second = (list first second);
Truthy = # () true;
Falsey = # () false;
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
`;