import Link from "next/link";

import { Flex, Text, Heading } from "@chakra-ui/react";

import { Attachment } from "./Attachment";
import { DarkModeSwitch } from "./DarkModeSwitch";

export function Header() {
  return (
    <Flex
      as="header"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      maxWidth="48rem"
      py={2}
      px={4}
    >
      <Flex flexDirection="column">
        <Link href="/">
          <Heading>Filestr 🥩</Heading>
          <Text color="gray.400">A nostr file explorer</Text>
        </Link>
      </Flex>
      <Flex>
        <Attachment />
        <DarkModeSwitch />
      </Flex>
    </Flex>
  );
}
