module util
require [
    stdlib.io :as io
    ]

calculus a b x y = [
    ax = * a x
    by = * b y
    + ax by
]

both pred1 pred2 = [
    _fn el = and (pred1 el) (pred2 el)
    _fn
]

sampleMap = {
    :k1 "value1"
    :k2 "value2"
}

bmiComponent = #comp {
    height = 100
    weight = 55
    bmi = * height weight
}

UserInput = #comp {
    height = 55
    weight = 100
}

BMIComponent = #comp {
    bmi = * UserInput.height UserInput.weight
}