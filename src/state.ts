import { atom } from "jotai";

export const relaysAtom = atom([
  "wss://nos.lol",
  "wss://nostr.wine",
  "wss://relay.snort.social",
  "wss://nostr-relay.nokotaro.com/",
  "wss://nostr-world.h3z.jp/",
]);
export const pubkeyAtom = atom();
