import { useState, useEffect, useMemo } from "react";

import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useToast } from "@chakra-ui/react";

import { useSub } from "../nostr";
import { Layout } from "../components/Layout";
import { NewFile } from "../components/NewFile";

const New = ({}) => {
  const toast = useToast();
  const [pubkey, setPubkey] = useState();
  const relays = [];
  const sub = useSub({
    filters: [{ kinds: [3], authors: [pubkey], limit: 1 }],
    enabled: pubkey,
    options: { unsubscribeOnEose: true },
  });
  const kind3relays =
    sub.events.length > 0 ? JSON.parse(sub.events[0].content) : {};
  const relayUrls = Object.keys(kind3relays);

  useEffect(() => {
    try {
      window.nostr.getPublicKey().then((pk) => {
        setPubkey(pk);
      });
    } catch (error) {
      toast({
        title: "Could not get nostr pubkey",
        description: "Use a nostr extension like nos2x or Alby",
      });
    }
  }, []);

  function filePublished() {
    toast({
      title: "File published",
      description: `The file has been published successfully`,
    });
  }
  return (
    <>
      <Head>
        <title>New File</title>
      </Head>
      <Layout>
        <NewFile relays={relayUrls} onSuccess={filePublished} />
      </Layout>
    </>
  );
};

export default New;
