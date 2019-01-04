## Notes

- Regular scripting language that provides basic primitives
  - Expressions, functions and the likes
- Visualization and interaction at the component level
- Application is a wiring of components
  - Wirings define the data flow
  - Hence paths of data flow can be traced
  - Inputs through outputs can be identified.

## Component

- A unit of abstraction (hiding low level details)
  - What you abstract as a component depends on what you want to interact with and visualize.
  - Should be composable. Group of components can be composed into a higher level component. Thus forming layers in your application.
  - Just a bunch of code. Could be just an expression or a block of code
- Has 0 or more inputs
- Has 0 ..1 output . What does it mean to not have a component
- Documentation, spec as optional. 
  - Should spec be mandated?
  - UID, Name mandatory
- Only pure code allowed? 
  - How are effects handled? Allowed?
  - How is IO handled?
  - Can it be stateful? 
   
## Architecture

- How is a piece of code evaluated?
- How is the whole application evaluated?

## Project Structure

Sample-Proj
    - lib
    - components


### Code , Syntax

```code
#{
    :name   "Adder"
    :doc    "Given two numbers, adds them and emits a sum"
    :ver    "1.0"
    :uid    "math/adder"
    :params (a b)
    :out   + a b
    :type   :component
}
```
- Let's say we have slider1, slider2 and adder and tap components

```code
#{
    :name   "AppWirings"
    :doc    "Wirings between components in the application"
    :ver    "1.0"
    :type   :wiring
    :wirings [
        {
            :src "Slider1"
            :tgt  "Adder.a"
        }

        {
            :src "Slider2"
            :tgt  "Adder.b"
        }

        {
            :src    "Adder"
            :tgt    "Tap.obj"
        }
    ]
}
```

- Perhaps, wirings can be encapsulated within a component
  - Which would mandate a **main** component
  - But this helps build higher order component.
- Component types need to be identified
  - May be Simple, HigherOrder, Stateful

```code
#{
    :type   :component
    :name   "Main"
    :params ()
    :wiring MainWiring
}
```

```code
#{
    :type       :component
    :name       "Main"
    :params     ()
    :children   [
        {:name  "slider1"}
        {:name  "slider2"}
        {:name  "Adder"}
    ]
    :wirings    [
        {:src   "slider1"   :tgt    "Adder.a"}
        {:src   "slider2"   :tgt    "Adder.b"}
    ]
    :output "Adder"
}
```

or

```code
#{
    :name   "Adder"
    :doc    "Given two numbers, adds them and emits a sum"
    :ver    "1.0"
    :uid    "math/adder"
    :params (a b)
    :out    [
        adder (adder a b) (multiplier a b)
    ]
    :type   :component-group
    :deps   [["Addder" 1.0 "adder"] ["Multiplier" 0.5 "multiplier"]]
}
```