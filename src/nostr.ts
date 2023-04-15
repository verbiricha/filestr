import { useState, useEffect } from "react";
import { RelayPool } from "nostr-relaypool";
import { utils } from "nostr-tools";

const defaultRelays = [
  "wss://nostr-pub.wellorder.net",
  "wss://nostr-relay.nokotaro.com/",
  "wss://relay.nostr.band/",
  "wss://relay.damus.io/",
  "wss://nos.lol/",
  "wss://offchain.pub/",
  "wss://relay.nostr.wirednet.jp/",
  "wss://nostr.wine/",
];

const pool = new RelayPool(defaultRelays);

export function useSub({ filters, relays = defaultRelays, options = {} }) {
  const [events, setEvents] = useState([]);
  const [seenOn, setSeenOn] = useState({});

  function onEvent(ev, isAfterEose, relayURL) {
    setSeenOn((_seen) => {
      const soFar = _seen[ev.id] || [];
      if (!soFar.includes(relayURL)) {
        soFar.push(relayURL);
      }
      return { ..._seen, [ev.id]: soFar };
    });
    setEvents((_evs) => {
      return utils.insertEventIntoDescendingList(_evs, ev);
    });
  }

  function onEose(relayURL, timestamp) {}

  useEffect(() => {
    return pool.subscribe(filters, relays, onEvent, undefined, onEose, options);
  }, []);

  return { events, seenOn };
}

export function useProfile(pubkey: string) {
  const [profile, setProfile] = useState();

  useEffect(() => {
    pool.fetchAndCacheMetadata(pubkey).then(setProfile);
  }, [pubkey]);

  return profile ? JSON.parse(profile.content) : profile;
}

export async function getRelayMetadata(url) {
  try {
    const relayUrl = new URL(url);
    const isSecure = url.startsWith("wss://");
    const relayInfoUrl = `${isSecure ? "https" : "http"}://${relayUrl.host}`;
    return await fetch(relayInfoUrl, {
      headers: {
        Accept: "application/nostr+json",
      },
    }).then((res) => res.json());
  } catch (error) {
    console.error(error);
  }
}