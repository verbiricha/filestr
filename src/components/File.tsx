import React, { useRef, useMemo } from "react";

import { Canvas, useLoader } from "react-three-fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "@react-three/drei";

import Link from "next/link";

import {
  Avatar,
  Flex,
  Heading,
  Code,
  Tag,
  Image as BaseImage,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import { LinkIcon } from "@chakra-ui/icons";
import { nip19 } from "nostr-tools";

import { InputCopy } from "./InputCopy";
import { NoteReactions } from "./NoteReactions";
import { Profile } from "./Profile";

function Image({ blurhash, url, alt }) {
  return <BaseImage objectFit="cover" src={url} alt={alt} />;
}

function Video({ url }) {
  return <video key={url} controls src={url} />;
}

function Audio({ url }) {
  return <audio key={url} controls src={url} />;
}

function STLMesh({ url }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry}>
      <meshPhongMaterial color="purple" />
    </mesh>
  );
}

function STLViewer({ url }) {
  return (
    <Flex sx={{ position: "relative" }} width="100%">
      <Canvas
        style={{ height: "320px" }}
        camera={{ position: [250, 250, 20], fov: 20 }}
      >
        <STLMesh url={url} />
        <OrbitControls panSpeed={0.5} rotateSpeed={0.4} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} />
        <directionalLight
          intensity={0.5}
          position={[-10, 10, 5]}
          color="white"
        />
      </Canvas>
    </Flex>
  );
}

export function File({ event, relays }) {
  const blurhash = event.tags.find((t) => t[0] === "blurhash")?.at(1);
  const url =
    event.tags.find((t) => t[0] === "url")?.at(1) ||
    event.tags.find((t) => t[0] === "u")?.at(1);
  const mime =
    event.tags.find((t) => t[0] === "m")?.at(1) ||
    event.tags.find((t) => t[0] === "type")?.at(1);
  const hashtags = event.tags.filter((t) => t[0] === "t").map((t) => t.at(1));
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
        <Flex justifyContent="space-between">
          <Profile pubkey={event.pubkey} relays={relays} />
          <Link key={event.id} href={`/e/${nevent}`}>
            <LinkIcon />
          </Link>
        </Flex>
      </CardHeader>
      <CardBody>
        <Text>{event.content}</Text>
        <Flex mt={2}>
          {mime.startsWith("video") && <Video url={url} />}
          {mime.startsWith("audio") && <Audio url={url} />}
          {mime.endsWith("stl") && <STLViewer url={url} />}
          {mime.startsWith("image") && (
            <Image blurhash={blurhash} url={url} alt={event.content} />
          )}
        </Flex>
        <Flex my={2} flexWrap="wrap">
          {hashtags.map((t) => (
            <Link key={t} href={`/t/${t}`}>
              <Tag size="lg" mr={2} mb={2}>
                {t}
              </Tag>
            </Link>
          ))}
        </Flex>
        <Flex flexDirection="column">
          <Heading fontSize="md" my={2}>
            File URL
          </Heading>
          <InputCopy text={url} />
        </Flex>
        <Flex flexDirection="column">
          <Heading fontSize="md" my={2}>
            Nostr id
          </Heading>
          <InputCopy text={nevent} />
        </Flex>
      </CardBody>
      <CardFooter>
        <NoteReactions event={event} relays={relays} />
      </CardFooter>
    </Card>
  );
}
