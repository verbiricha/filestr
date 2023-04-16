import Link from "next/link";

import {
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  StatGroup,
} from "@chakra-ui/react";

import { useSub } from "../nostr";

export function RelayStats({ url }) {
  const files = useSub({
    filters: [
      {
        kinds: [1063],
      },
    ],
    relays: [url],
    options: {
      unsubscribeOnEose: true,
    },
  });
  const markets = useSub({
    filters: [
      {
        kinds: [30017, 30018],
      },
    ],
    relays: [url],
    options: {
      unsubscribeOnEose: true,
    },
  });
  return (
    <>
      <StatGroup>
        <Stat>
          <StatLabel>Files</StatLabel>
          <StatNumber>{files.events.length}</StatNumber>
        </Stat>
      </StatGroup>
    </>
  );
}
