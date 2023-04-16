import { useState, useEffect, useMemo } from "react";

import Head from "next/head";
import { useToast } from "@chakra-ui/react";
import { useAtom } from "jotai";

import { relaysAtom, pubkeyAtom } from "../../state";
import { Layout } from "../../components/Layout";
import { NewFile } from "../../components/NewFile";
import { useNostrPubkey } from "../../hooks/useNostrPubkey";

const New = ({}) => {
  const toast = useToast();
  const [pubkey] = useAtom(pubkeyAtom);
  const [relayUrls] = useAtom(relaysAtom);
  useNostrPubkey();

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
