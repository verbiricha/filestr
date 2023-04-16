import { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useAtom } from "jotai";

import { relaysAtom } from "../state";
import { Layout } from "../components/Layout";

const Feed = dynamic(
  () => import("../components/Feed").then((mod) => mod.Feed),
  { ssr: false }
);

const Index = ({}) => {
  const [relays] = useAtom(relaysAtom);
  return (
    <>
      <Head>
        <title>Filestr 🥩</title>
        <meta name="og:title" content="A nostr File explorer" />
        <meta
          name="og:description"
          content="Browse and publish files on nostr"
        />
      </Head>
      <Layout>
        <Feed key="home" filter={{ kinds: [1063] }} relays={relays} />
      </Layout>
    </>
  );
};

export default Index;
