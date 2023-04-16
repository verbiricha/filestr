import dynamic from "next/dynamic";

import { Flex, Text, Heading, Code } from "@chakra-ui/react";
import { nip19 } from "nostr-tools";

import { RelayFavicon } from "./RelayFavicon";
import { InputCopy } from "./InputCopy";

export function RelayMetadata({ url }) {
  const nrelay = nip19.nrelayEncode(url);
  return (
    <>
      <Flex alignItems="center">
        <RelayFavicon url={url} />
        <Heading fontSize="2xl" ml={4}>
          {url}
        </Heading>
      </Flex>
    </>
  );
}
