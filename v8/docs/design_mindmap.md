
### Tenets

- Everything is a component (See below)
    - Where do functions live? That isn't part of a component spec? 
- Components are connected thus forming a mesh.
- Components are reactive. Dependencies between componenents (through their properties) define the dataflow. A change in a component property is propagated downstream
    - Breadth first? Depth first? Atomic ? Sync vs async? Freeze the world while doing so? Buffering, back pressure, throttle etc.?
- 

### Component
- A component is a set of name, value pairs called properties
- A value can be a literal, an expression or a function (defn)
    - Can a value be an another component? Can it be any component ref that changes over time? aka dynamic?
- A property can depend on 1 or more other properties of itself or of an another component
    - Can it depend on a property of any component? Any limitations
    - A property which is not dependant on anything becomes the components input. Unless marked otherwise
        - A property which is neither dependent nor an input is invalid and must be a constant that should live elsewhere.
- Property (computed ones) evaluation: Lazy or eager? Everytime or just once?
- Where do they live? Packages or modules or layers ?
- What about the visibility of components? Its properties ? Can everyone else see ? Can anyone write/update?

### How does the world move forward?

- A mesh of components is static info, right? 
- With a given seed value , the state is computed (effects considered state).
