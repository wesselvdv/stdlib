/**
 * Construct a new `HashSet` from a `Collection` of values
 *
 * @tsplus static HashSet/Ops from
 */
export function from<A>(elements: Collection<A>): HashSet<A> {
  const set = HashSet.empty<A>().beginMutation()
  for (const v of elements) {
    set.add(v)
  }
  return set.endMutation()
}
