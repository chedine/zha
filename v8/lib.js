const corefns = `
    map list f = [
        loop list (conj $state (f $val))
    ]

    filter list f = [
        loop list [
            predicateResult = f $val
            if predicateResult (conj $state $val) $state
        ]
    ]

    every list f = [
        loop list [
            predicateResult = f $val
            if predicateResult true (return false)
        ]
    ]

    any list f = [
        loop list [
            predicateResult = f $val
            if predicateResult (return true) false
        ]
    ]
	
	reduce list f seed = [
		loop list [
			f $state $val
		] seed
	]
	even? n = eq (% n 2) 0
	odd?  n = eq (% n 2) 1
	type val    = js/call val "type"
	true? x = eq x true
	false? x = eq x false
	checkType val target = [
		t = type val
		js/call t "eq" target 
	]
	number? val = checkType val :Number
	string? val = checkType val :String
	bool? val = checkType val :Boolean
	vec? val = checkType val :Vec
	list? val = checkType val :Vec
	fn? val = checkType val :Fn
	hmap? val = checkType val :HMap
	empty? val = eq (count val) 0
	keyword? val = checkType val :Keyword
	nil? val = eq val nil
	
	identity x = x
	echo x = x
	
	toUpper str   = js/call str "toUpperCase"
	toLower str   = js/call str "toLowerCase"
	substr str frm = js/call str "substring" frm
	count seq     = js/call seq "count"
	last seq      = js/call seq "last"
	first seq     = js/call seq "first"
	nth seq index = js/call seq "nth" index
	second seq    = js/call seq "second"
	third seq     = js/call seq "third"
	rest seq      = js/call seq "rest"
	take n seq   = js/call seq "take" n
	takeLast n seq  = js/call seq "takeLast" n
	takeFrom start n seq = js/call seq "takeFrom" start n
	drop n seq    = js/call seq "drop" n
	get seq index = js/call seq "get" index
	conj seq el   = js/call seq "conj" el
	concat seq seq2 = js/call seq "concat" seq2
    assoc seq i val = js/call seq "assoc" i val
    h/el sel = js/call (h/doc) "querySelector" sel
`

Zha.eval(corefns);