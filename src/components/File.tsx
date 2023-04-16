import { useMemo } from "react";

import {
  Avatar,
  Flex,
  Code,
  Tag,
  Image,
  Text,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { nip19 } from "nostr-tools";

import { Profile } from "./Profile";

export function File({ event, relays }) {
  const url =
    event.tags.find((t) => t[0] === "url")?.at(1) ||
    event.tags.find((t) => t[0] === "u")?.at(1);
  const mime =
    event.tags.find((t) => t[0] === "m")?.at(1) ||
    event.tags.find((t) => t[0] === "type")?.at(1);
  const hashtags = event.tags.filter((t) => t[0] === "t").map((t) => t.at(1));
  const nevent = useMemo(
    () =>
      nip19.neventEncode({
        id: event.id,
        author: event.pubkey,
        relays,
      }),
    [event, relays]
  );
  return (
    <Card>
      <CardHeader>
        <Flex justifyContent="space-between">
          <Profile pubkey={event.pubkey} relays={relays} />
        </Flex>
      </CardHeader>
      <CardBody>
        <Text>{event.content}</Text>
        <Flex my={2} flexWrap="wrap">
          {hashtags.map((t) => (
            <Tag key={t} size="lg" mr={2} mb={2}>
              {t}
            </Tag>
          ))}
        </Flex>
        <Flex alignItems="center" justifyContent="center">
          {mime.startsWith("video") && <video controls src={url} />}
          {mime.startsWith("audio") && <audio controls src={url} />}
          {mime.startsWith("image") && (
            <Image
              sx={{ borderRadius: "12px" }}
              objectFit="cover"
              src={url}
              alt={event.content}
            />
          )}
        </Flex>
      </CardBody>
    </Card>
  );
}
