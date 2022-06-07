describe.concurrent("List", () => {
  it("equals", () => {
    assert.isTrue(
      List(0, 1, 2)
        == List(0, 1, 2)
    )
  })
  it("concat", () => {
    assert.isTrue(
      List(0, 1, 2) + List(3, 4, 5)
        == List(0, 1, 2, 3, 4, 5)
    )
  })
  it("prepend", () => {
    assert.isTrue(2 + List(3, 4, 5) == List(2, 3, 4, 5))
  })
  it("builder", () => {
    const builder = List.builder<number>()
    builder.append(0)
    builder.append(1)
    builder.append(2)
    assert.isTrue(
      builder.build()
        == List(0, 1, 2)
    )
  })
  it("map", () => {
    assert.isTrue(
      List(1, 2, 3).map((n) => n + 1)
        == List(2, 3, 4)
    )
  })
  it("flatMap", () => {
    assert.isTrue(
      List(1, 2, 3).flatMap((n) => List(n + 1))
        == List(2, 3, 4)
    )
  })
  it("flatMap Iterable", () => {
    assert.isTrue(
      List(0, 1).flatMap((n) => [n + 1]).asList()
        == List(1, 2)
    )
  })
  it("asCollection", () => {
    assert.isTrue(List(0, 1).asCollection() == List(0, 1))
  })
  it("partition", () => {
    assert.isTrue(List.empty<number>().partition((n) => n > 2) == Tuple(List.empty<number>(), List.empty<number>()))
    assert.isTrue(List(1, 3).partition((n) => n > 2) == Tuple(List(1), List(3)))
  })

  it("partitionMap", () => {
    assert.isTrue(
      List.empty<Either<string, number>>().partitionMap(identity) ==
        Tuple(List.empty<string>(), List.empty<number>())
    )
    assert.isTrue(
      List(Either.right(1), Either.left("foo"), Either.right(2)).partitionMap(identity) ==
        Tuple(List("foo"), List(1, 2))
    )
  })
})
