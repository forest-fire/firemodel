export interface IMockOptions {
  /**
   * Typically it's a bad idea to perform a Mock
   * on a _real_ Firebase database. In order to
   * allow this you must explicitly state that this
   * is your intention
   */
  allowRealDatabase?: boolean;
}
