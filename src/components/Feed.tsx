import { useState, useEffect } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { useInView } from "react-intersection-observer";

import { useSub } from "../nostr";

import { Event } from "./Events";

const PAGE = 20;

function FeedPage({ until, relays, filter }) {
  const [next, setNext] = useState();
  const filters = [
    {
      until,
      limit: PAGE,
      ...filter,
    },
  ];
  const { events } = useSub({
    filters,
    relays,
    options: {
      unsubscribeOnEose: true,
    },
  });
  const { ref, inView, entry } = useInView({
    threshold: 0,
  });
  const oldest = events[events.length - 1];
  useEffect(() => {
    if (!oldest || next) {
      return;
    }
    const timestamp = oldest.created_at;
    if (inView) {
      setNext(timestamp);
    }
  }, [next, oldest, inView]);

  return (
    <>
      {events.map((ev, idx) => (
        <>
          <Event key={ev.id} event={ev} relays={relays} />
          {idx === events.length - 1 && !next && <div ref={ref}></div>}
        </>
      ))}
      {next && <FeedPage filter={filter} until={next} relays={relays} />}
    </>
  );
}

export function Feed({ filter, relays }) {
  const [now] = useState(Math.floor(Date.now() / 1000));
  const [lastSeen, setLastSeen] = useState(now);
  const [until, setUntil] = useState();
  const filters = [
    {
      since: now,
      ...filter,
    },
    {
      limit: PAGE,
      until: now,
      ...filter,
    },
  ];

  const { events } = useSub({
    filters,
    relays,
  });
  const oldest = events[events.length - 1];
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (!oldest || until) {
      return;
    }
    const timestamp = oldest.created_at;
    if (inView) {
      setUntil(timestamp);
    }
  }, [until, oldest, inView]);

  const newEvents = events.filter((e) => e.created_at > lastSeen);
  const feedEvents = events.filter((e) => e.created_at <= lastSeen);

  return (
    <>
      <Button
        isDisabled={newEvents.length === 0}
        isLoading={newEvents.length === 0}
        onClick={() => setLastSeen(newEvents[0].created_at)}
      >
        {newEvents.length > 0 && `Show ${newEvents.length} more`}
      </Button>
      {feedEvents.map((ev, idx) => (
        <Box key={ev.id} mb={4}>
          <Event key={`ev-${ev.id}`} event={ev} relays={relays} />
          {idx === feedEvents.length - 1 && !until && <div ref={ref}></div>}
        </Box>
      ))}
      {until && <FeedPage filter={filter} until={until} relays={relays} />}
    </>
  );
}
