var ZhaFns = `
map transform lst = last (loop lst t1 empty) where t1 item state = conj state (transform item), empty = (call list);
identity x = x;
echo x = x;
inc x = + x 1;


toUpper str   = ->Str (js/call s "toUpperCase") where s = js/prop str "value";
toLower str   = ->Str (js/call s "toLowerCase") where s = js/prop str "value";
substr str frm = ->Str (js/call s "substr" frm) where s = js/prop str "value";
count seq     = js/call seq "count";
last seq      = js/call seq "last";
first seq     = js/call seq "first";
nth seq index = js/call seq "nth" index;
get seq index = js/call seq "get" index;
conj seq el   = js/call seq "conj" el;

constantly  x = #  x;
six = contantly 6;

pipe fnlist = # (val) (last (loop fnlist chain val)) 
    where chain fn state = fn state;
`;