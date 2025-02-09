import { concreteChunk, concreteChunkId } from "@tsplus/stdlib/collections/Chunk/definition"

/**
 * Returns the last index of the element that satisfies the predicate.
 *
 * @tsplus fluent Chunk findLastIndex
 */
export function findLastIndex_<A>(self: Chunk<A>, f: Predicate<A>): Option<number> {
  concreteChunk(self)

  const iterator = concreteChunkId(self)._reverseArrayLikeIterator()
  let next
  let index = self.length - 1

  while ((next = iterator.next()) && !next.done) {
    const array = next.value
    const len = array.length
    let i = len - 1
    while (i >= 0) {
      const a = array[i]!
      if (f(a)) {
        return Option.some(index)
      }
      i--
      index--
    }
  }

  return Option.none
}

/**
 * Returns the last index of the element that satisfies the predicate.
 *
 * @tsplus static Chunk/Aspects findLastIndex
 */
export const findLastIndex = Pipeable(findLastIndex_)
