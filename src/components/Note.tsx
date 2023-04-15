import { useMemo } from "react";
import Link from "next/link";

import {
  Avatar,
  Flex,
  Text,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { nip19 } from "nostr-tools";

import { Profile } from "./Profile";

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;

  // Calculate the differences between the current date and the provided timestamp in minutes, hours, and days
  const diffInMinutes = Math.round(diffInMs / (1000 * 60));
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  // Use the Intl.RelativeTimeFormat API to format the relative time
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (diffInMinutes < 60) {
    const formattedDate = formatter.format(-diffInMinutes, "minute");
    return formattedDate;
  }

  if (diffInHours < 24) {
    const formattedDate = formatter.format(-diffInHours, "hour");
    return formattedDate;
  }

  if (diffInDays < 7) {
    const formattedDate = formatter.format(-diffInDays, "day");
    return formattedDate;
  }

  // If the difference is more than 7 days, use the original date and time format
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const formattedDate = `${day} ${month} ${year}, at ${time}`;
  return formattedDate;
}

export function Note({ event, relays }) {
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
        <Flex alignItems="center" justifyContent="space-between">
          <Profile pubkey={event.pubkey} relays={relays} />
          <Text color="gray.400">
            {formatTimestamp(event.created_at * 1000)}
          </Text>
        </Flex>
      </CardHeader>
      <Link href={`https://snort.social/e/${nevent}`}>
        <CardBody>
          <Text>{event.content}</Text>
        </CardBody>
      </Link>
    </Card>
  );
}