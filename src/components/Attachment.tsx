import { useRouter } from "next/router";

import { IconButton } from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";

export const Attachment = () => {
  const router = useRouter();
  function createFile() {
    router.push("/new");
  }
  return (
    <IconButton
      variant="unstyled"
      icon={<AttachmentIcon />}
      aria-label="Create file"
      onClick={createFile}
    />
  );
};
