describe.concurrent("Encoder", () => {
  it("boolean", () => {
    const boolean: Encoder<boolean> = Derive()
    assert.deepEqual(boolean.encode(true), true)
    assert.deepEqual(boolean.encode(false), false)
  })
  it("string", () => {
    const string: Encoder<string> = Derive()
    assert.deepEqual(string.encode("ok"), "ok")
  })
  it("number", () => {
    const number: Encoder<number> = Derive()
    assert.deepEqual(number.encode(1), 1)
  })
  it("date", () => {
    const string: Encoder<Date> = Derive()
    const date = new Date()
    assert.deepEqual(string.encode(date), date.toISOString())
  })
  it("literal-str", () => {
    const encoder: Encoder<"hello"> = Derive()
    assert.deepEqual(encoder.encode("hello"), "hello")
  })
  it("literal-num", () => {
    const encoder: Encoder<1> = Derive()
    assert.deepEqual(encoder.encode(1), 1)
  })
  it("record", () => {
    const encoder: Encoder<Record<string, { foo: string }>> = Derive()
    const encoder2: Encoder<Record<"a", { foo: string }>> = Derive()
    const encoder3: Encoder<Record<"a" | "b", { foo: string }>> = Derive()
    assert.deepStrictEqual(encoder.encode({ a: { foo: "a" } }), { a: { foo: "a" } })
    assert.deepStrictEqual(encoder2.encode({ a: { foo: "a" } }), { a: { foo: "a" } })
    assert.deepStrictEqual(
      encoder3.encode({ a: { foo: "a" }, b: { foo: "b" } }),
      { a: { foo: "a" }, b: { foo: "b" } }
    )
  })
  it("struct", () => {
    interface Person {
      firstName: string
      lastName: string
      age?: number
    }
    const encoder: Encoder<Person> = Derive()
    assert.deepEqual(
      encoder.encode({ firstName: "Michael", lastName: "Arnaldi" }),
      { firstName: "Michael", lastName: "Arnaldi" }
    )
  })
  it("tagged", () => {
    interface A {
      readonly _tag: "A"
    }
    interface B {
      readonly _tag: "B"
    }
    interface C {
      readonly _tag: "C"
      readonly field: string
    }
    type Union = A | B | C
    const encoder: Encoder<Union> = Derive()
    assert.deepEqual(encoder.encode({ _tag: "A" }), { _tag: "A" })
    assert.deepEqual(encoder.encode({ _tag: "B" }), { _tag: "B" })
    assert.deepEqual(encoder.encode({ _tag: "C", field: "F" }), { _tag: "C", field: "F" })
  })
  it("union", () => {
    const encoder: Encoder<string | number> = Derive()
    assert.equal(encoder.encode("ok"), "ok")
    assert.equal(encoder.encode(1), 1)
  })
  it("array", () => {
    const encoder: Encoder<string[]> = Derive()
    assert.deepEqual(encoder.encode(["a", "b", "c"]), ["a", "b", "c"])
  })
  it("chunk", () => {
    const encoder: Encoder<Chunk<string>> = Derive()
    assert.deepEqual(encoder.encode(Chunk("a", "b", "c")), ["a", "b", "c"])
  })
  it("list", () => {
    const encoder: Encoder<List<string>> = Derive()
    assert.deepEqual(encoder.encode(List("a", "b", "c")), ["a", "b", "c"])
  })
  it("immutable array", () => {
    const encoder: Encoder<ImmutableArray<string>> = Derive()
    assert.deepEqual(encoder.encode(ImmutableArray("a", "b", "c")), ["a", "b", "c"])
  })
  it("either", () => {
    const encoder: Encoder<Either<number, string>> = Derive()
    assert.deepEqual(encoder.encode(Either.left(0)), Either.left(0))
    assert.deepEqual(encoder.encode(Either.right("ok")), Either.right("ok"))
  })
  it("option", () => {
    const encoder: Encoder<Option<string>> = Derive()
    assert.deepEqual(encoder.encode(Option.none), Option.none)
    assert.deepEqual(encoder.encodeJSON(Option.none), "{\"_tag\":\"None\"}")
    assert.deepEqual(encoder.encode(Option.some("ok")), Option.some("ok"))
  })
  it("validated", () => {
    /** @tsplus implicit local */
    const Int = Validation<number, "Int">((n) => Number.isInteger(n))
    type Int = Validation.Type<typeof Int>
    const encoderInt: Encoder<Int> = Derive()
    /** @tsplus implicit local */
    const Id = Validation<string, "Id">((n) => n.startsWith("id:"))
    type Id = Validation.Type<typeof Id>
    const encoderId: Encoder<Id> = Derive()

    assert.equal(encoderInt.encode(1 as Int), 1)
    assert.equal(encoderId.encode("id:hello" as Id), "id:hello")
  })
})
