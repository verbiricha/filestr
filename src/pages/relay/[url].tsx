import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";

import { useToast, Heading, Button } from "@chakra-ui/react";

import { nip19 } from "nostr-tools";

import { Layout } from "../../components/Layout";
import { NewFile } from "../../components/NewFile";
import { RelayMetadata } from "../../components/RelayMetadata";

const Feed = dynamic(
  () => import("../../components/Feed").then((mod) => mod.Feed),
  { ssr: false }
);

const RelayStats = dynamic(
  () => import("../../components/RelayStats").then((mod) => mod.RelayStats),
  { ssr: false }
);

const Relay = ({ url, nrelay }) => {
  const toast = useToast();
  const [showNew, setShowNew] = useState(false);
  function filePublished() {
    toast({
      title: "File published",
      description: `The file has been published to ${url}`,
    });
    setShowNew(false);
  }
  return (
    <>
      <Head>
        <title>{url}</title>
        <meta name="og:title" content={url} />
      </Head>
      <Layout>
        <RelayMetadata url={url} />
        {showNew ? (
          <NewFile
            relays={[url]}
            onCancel={() => setShowNew(false)}
            onSuccess={filePublished}
          />
        ) : (
          <Button onClick={() => setShowNew(true)}>New file</Button>
        )}
        <Feed kinds={[1063]} relay={url} />
      </Layout>
    </>
  );
};

export async function getServerSideProps(context) {
  const { url } = context.query;
  try {
    const decoded = nip19.decode(url);
    if (decoded.type === "nrelay") {
      const relay = decoded.data;
      return {
        props: {
          url: relay,
          nrelay: url,
        },
      };
    }
    return {
      redirect: {
        permanent: true,
        destination: "/",
      },
    };
  } catch (error) {
    return {
      redirect: {
        permanent: true,
        destination: "/",
      },
    };
  }
}

export default Relay;
