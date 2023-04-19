import Head from "next/head";
import dynamic from "next/dynamic";

import { nip19 } from "nostr-tools";

import { Layout } from "../../components/Layout";

const NostrEvent = dynamic(
  () => import("../../components/NostrEvent").then((mod) => mod.NostrEvent),
  { ssr: false }
);

const Nevent = ({ id, pubkey, relays }) => {
  return (
    <>
      <Head>
        <title>{pubkey}</title>
      </Head>
      <Layout>
        <NostrEvent id={id} pubkey={pubkey} relays={relays} isDetail={true} />
      </Layout>
    </>
  );
};

export async function getServerSideProps(context) {
  const { nevent } = context.query;
  try {
    const decoded = nip19.decode(nevent);
    if (decoded.type === "nevent") {
      return {
        props: {
          id: decoded.data.id,
          pubkey: decoded.data.author,
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

export default Nevent;
