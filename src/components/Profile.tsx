import Link from "next/link";

import { Avatar, Flex, Text } from "@chakra-ui/react";

import { nip19 } from "nostr-tools";

import { useProfile } from "../nostr";
import { Username } from "./Username";

export function Profile({ pubkey, relays, includeBio }) {
  const profile = useProfile(pubkey);
  const nprofile = nip19.nprofileEncode({
    pubkey,
    relays,
  });
  return (
    <>
      <Link href={`/p/${nprofile}`}>
        <Flex alignItems="center" sx={{ overflow: "hidden" }}>
          <Avatar
            size="sm"
            mr={2}
            src={profile?.picture}
            name={profile?.display_name || profile?.name || pubkey}
          />
          <Username pubkey={pubkey} relays={relays} />
        </Flex>
      </Link>
      {includeBio && profile?.about && <Text>{profile.about}</Text>}
    </>
  );
}
