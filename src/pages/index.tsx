import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAtom } from "jotai";

import { relaysAtom } from "../state";
import { useSub } from "../nostr";
import { Layout } from "../components/Layout";
import { Feed } from "../components/Feed";

const Index = ({}) => {
  const [relays] = useAtom(relaysAtom);
  return (
    <>
      <Head>
        <title>Filestr 🥩</title>
        <meta name="og:title" content="A nostr File explorer" />
        <meta name="og:description" content="Browse files in nostr" />
      </Head>
      <Layout>
        <Feed filter={{ kinds: [1063] }} relays={relays} />
      </Layout>
    </>
  );
};

export default Index;
