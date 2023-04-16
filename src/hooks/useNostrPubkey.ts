import { useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";

import { relaysAtom, pubkeyAtom } from "../state";
import { useSub } from "../nostr";

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch (error) {
    console.error(error);
    return {};
  }
}

export function useNostrPubkey() {
  const [relays, setRelays] = useAtom(relaysAtom);
  const [pubkey, setPubkey] = useAtom(pubkeyAtom);

  const sub = useSub({
    filters: [{ kinds: [3], authors: [pubkey], limit: 1 }],
    options: { unsubscribeOnEose: true },
    enabled: pubkey,
  });

  const kind3relays = useMemo(() => {
    return sub.events.length > 0 ? safeJsonParse(sub.events[0].content) : {};
  }, [sub.events]);

  const relayUrls = useMemo(() => {
    return Object.keys(kind3relays);
  }, [kind3relays]);

  useEffect(() => {
    try {
      window.nostr.getPublicKey().then((pk) => {
        setPubkey(pk);
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (relayUrls.length > 0) {
      setRelays(relayUrls);
    }
  }, [relayUrls]);
}
