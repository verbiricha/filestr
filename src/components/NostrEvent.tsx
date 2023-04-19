import { Text } from "@chakra-ui/react";

import { useSub } from "../nostr";
import { Event } from "./Events";

export function useNostrEvent({ id, pubkey, relays }) {
  const filters = [
    {
      ids: [id],
      authors: [pubkey],
      limit: 1,
    },
  ];

  const { events } = useSub({
    filters,
    relays,
  });

  return events[0];
}

export function NostrEvent({ id, pubkey, relays, ...rest }) {
  const ev = useNostrEvent({ id, pubkey, relays });
  return ev ? (
    <Event event={ev} relays={relays} {...rest} />
  ) : (
    <Text>Fetching event</Text>
  );
}
