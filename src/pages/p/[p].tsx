import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

import { Heading, Button } from "@chakra-ui/react";

import { nip19 } from "nostr-tools";

import { Layout } from "../../components/Layout";

const Feed = dynamic(
  () => import("../../components/Feed").then((mod) => mod.Feed),
  { ssr: false }
);

const NostrProfile = dynamic(
  () => import("../../components/Profile").then((mod) => mod.Profile),
  { ssr: false }
);

const Profile = ({ pubkey, relays }) => {
  return (
    <>
      <Head>
        <title>{pubkey}</title>
      </Head>
      <Layout>
        <NostrProfile pubkey={pubkey} includeBio={true} />
        <Feed filter={{ kinds: [1063], authors: [pubkey] }} relays={relays} />
      </Layout>
    </>
  );
};

export async function getServerSideProps(context) {
  const { p } = context.query;
  try {
    const decoded = nip19.decode(p);
    if (decoded.type === "npub" || decoded.type === "nprofile") {
      return {
        props: {
          pubkey: decoded.data.pubkey,
          relays: decoded.data.relays,
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

export default Profile;
