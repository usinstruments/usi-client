import { atomWithStorage } from "jotai/utils";

export function myStoredAtom<T>(key: string, initialValue: T) {
  return atomWithStorage<T>(key, initialValue, undefined, { getOnInit: true });
}
