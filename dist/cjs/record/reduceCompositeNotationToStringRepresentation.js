"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceCompositeNotationToStringRepresentation = void 0;
/**
   * **_reduceCompositeNotationToStringRepresentation**
   *
   * Reduces a `ICompositeKey` hash into string representation of the form:
   *
```typescript
`${id}::${prop}:${propValue}::${prop2}:${propValue2}`
```
   */
function reduceCompositeNotationToStringRepresentation(ck) {
    return (`${ck.id}` +
        Object.keys(ck)
            .filter(k => k !== "id")
            .map(k => `::${k}:${ck[k]}`));
}
exports.reduceCompositeNotationToStringRepresentation = reduceCompositeNotationToStringRepresentation;
//# sourceMappingURL=reduceCompositeNotationToStringRepresentation.js.map