import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAtom } from "jotai";

import { Heading, Button } from "@chakra-ui/react";

import { relaysAtom } from "../../state";
import { Layout } from "../../components/Layout";

const Feed = dynamic(
  () => import("../../components/Feed").then((mod) => mod.Feed),
  { ssr: false }
);

const Hashtag = ({}) => {
  const [relays] = useAtom(relaysAtom);
  const router = useRouter();
  const { t } = router.query;
  return (
    <>
      <Head>
        <title>#{t}</title>
      </Head>
      <Layout>
        <Heading>#{t}</Heading>
        <Feed
          relays={relays}
          filter={{
            kinds: [1063],
            "#t": [t],
          }}
        />
      </Layout>
    </>
  );
};

export default Hashtag;
