import { IFmRelationshipDirectionality } from "@/types";

/**
 * A helper method when designing relationships. In most cases when you
 * state a "inverse property" it means that the two entities can be
 * bi-directionly managed. If, however, you either don't want them to be
 * or in some cases the relationship can be "lossy" and automatic bi-directional
 * management is not possible.
 *
 * When you find yourself in this situation you can use this function in the
 * following manner:
```typescript
export default MyModel extends Model {
  @hasMany(Person, OneWay('children')) parent: fk;
}
```
 */
export function OneWay(
  inverseProperty: string
): [string, IFmRelationshipDirectionality] {
  return [inverseProperty, "one-way"];
}
