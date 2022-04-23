import { Env } from "@tsplus/stdlib/service/Env";
import type { Has } from "@tsplus/stdlib/service/Has";
import type { Tag } from "@tsplus/stdlib/service/Tag";

export const PatchSym = Symbol.for("@tsplus/stdlib/service/Patch");
export type PatchSym = typeof PatchSym;

export const _Input = Symbol.for("@tsplus/stdlib/service/Patch/Input");
export type _Input = typeof _Input;

export const _Output = Symbol.for("@tsplus/stdlib/service/Patch/Output");
export type _Output = typeof _Output;

/**
 * A `Patch<Input, Output>` describes an update that transforms a `Env<Input>`
 * to a `Env<Output>` as a data structure. This allows combining updates to
 * different services in the environment in a compositional way.
 *
 * @tsplus type Patch
 */
export interface Patch<Input, Output> {
  readonly [PatchSym]: PatchSym;
  readonly [_Input]: (input: Input) => void;
  readonly [_Output]: () => Output;
}

/**
 * @tsplus type Patch/Ops
 */
export interface PatchOps {
  $: PatchAspects;
}
export const Patch: PatchOps = {
  $: {}
};

/**
 * @tsplus type Patch/Aspects
 */
export interface PatchAspects {}

export abstract class BasePatch<Input, Output> implements Patch<Input, Output> {
  readonly [PatchSym]: PatchSym = PatchSym;
  readonly [_Input]!: (input: Input) => void;
  readonly [_Output]!: () => Output;
}

export class Empty<I, O> extends BasePatch<I, O> {
  readonly _tag = "Empty";

  constructor() {
    super();
  }
}

export class AddService<Env, T> extends BasePatch<Env, Env & Has<T>> {
  readonly _tag = "AddService";

  constructor(readonly tag: Tag<T>, readonly service: T) {
    super();
  }
}

export class AndThen<Input, Output, Output2> extends BasePatch<Input, Output2> {
  readonly _tag = "AndThen";

  constructor(readonly first: Patch<Input, Output>, readonly second: Patch<Output, Output2>) {
    super();
  }
}

export class RemoveService<Env, T> extends BasePatch<Env & Has<T>, Env> {
  readonly _tag = "RemoveService";

  constructor(readonly tag: Tag<T>) {
    super();
  }
}

export class UpdateService<Env, T> extends BasePatch<Env & Has<T>, Env & Has<T>> {
  readonly _tag = "UpdateService";

  constructor(readonly tag: Tag<T>, readonly update: (service: T) => T) {
    super();
  }
}

/**
 * @tsplus macro remove
 */
export function concretePatch<Input, Output>(
  _: Patch<Input, Output>
): asserts _ is
  | Empty<any, any>
  | AddService<any, any>
  | AndThen<any, any, any>
  | RemoveService<any, any>
  | UpdateService<any, any>
{
  //
}

/**
 * Applies a `Patch` to the specified `Env` to produce a new patched `Env`.
 *
 * @tsplus fluent Patch patch
 */
export function patch_<Input, Output>(self: Patch<Input, Output>, env: Env<Input>): Env<Output> {
  const loopResult = patchLoop(new Map(env.unsafeMap.internalMap), env.index, List(self as Patch<unknown, unknown>));
  return new Env(
    new ImmutableMap(loopResult[0]),
    loopResult[1]
  ) as Env<Output>;
}

/**
 * @tsplus static Patch/Aspects patch
 */
export const patch = Pipeable(patch_);

/**
 * @tsplus tailrec
 */
function patchLoop(
  env: Map<Tag<unknown>, [unknown, number]>,
  index: number,
  patches: List<Patch<unknown, unknown>>
): [Map<Tag<unknown>, [unknown, number]>, number] {
  if (patches.isNil()) {
    return [env, index];
  }
  const head = patches.head;
  concretePatch(head);
  const tail = patches.tail;
  switch (head._tag) {
    case "Empty": {
      return patchLoop(env, index, tail);
    }
    case "AddService": {
      return patchLoop(env.set(head.tag, [head.service, index]), index + 1, tail);
    }
    case "AndThen": {
      return patchLoop(env, index, tail.prependAll(List(head.first, head.second)));
    }
    case "RemoveService": {
      return patchLoop((env.delete(head.tag), env), index, tail);
    }
    case "UpdateService": {
      const [service, i] = env.get(head.tag)!;
      return patchLoop(env.set(head.tag, [head.update(service), i]), index, tail);
    }
  }
}

/**
 * An empty patch which returns the environment unchanged.
 *
 * @tsplus static Patch/Ops empty
 */
export function empty<I, O>(): Patch<I, O> {
  return new Empty();
}

/**
 * Combines two patches to produce a new patch that describes applying the
 * updates from this patch and then the updates from the specified patch.
 *
 * @tsplus fluent Patch combine
 */
export function combine_<Input, Output, Output2>(
  self: Patch<Input, Output>,
  that: Patch<Output, Output2>
): Patch<Input, Output2> {
  return new AndThen(self, that);
}

/**
 * Combines two patches to produce a new patch that describes applying the
 * updates from this patch and then the updates from the specified patch.
 *
 * @tsplus static Patch/Aspects combine
 */
export const combine = Pipeable(combine_);

/**
 * @tsplus static Patch/Ops diff
 */
export function diff<Input, Output>(oldValue: Env<Input>, newValue: Env<Output>): Patch<Input, Output> {
  const ordered = Array.from(oldValue.unsafeMap.internalMap.entries()).sort((a, b) => b[1][1] - a[1][1]);
  const missingServices = new Map(ordered);

  let patch = Patch.empty<any, any>();

  for (const [tag, [newService]] of newValue.unsafeMap.internalMap) {
    if (missingServices.has(tag)) {
      const [old] = missingServices.get(tag)!;
      missingServices.delete(tag);
      if (old !== newService) {
        patch = patch.combine(new UpdateService(tag, () => newService));
      }
    } else {
      missingServices.delete(tag);
      patch = patch.combine(new AddService(tag, newService));
    }
  }

  for (const [tag] of missingServices) {
    patch = patch.combine(new RemoveService(tag));
  }

  return patch;
}
