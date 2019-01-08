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
            if predicateResult true nil
        ]
    ]

    any list f = [
        loop list [
            predicateResult = f $val
            if predicateResult true nil
        ]
    ]
`