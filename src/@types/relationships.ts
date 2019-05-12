export type IFmRelationshipOperation =
  /** a hasMany relationship that is being set (where value was empty prior) */
  | "set"
  /** when a SET takes place on a hasOne which was already set */
  | "update"
  | "clear"
  /** a hasMany relationship which has had a new FK added */
  | "add"
  /** can be either a hasOne or hasMany relationship where props have been removed */
  | "remove";
