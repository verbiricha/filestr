import Link from "next/link";

import { IconButton } from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";

export const Attachment = () => {
  return (
    <Link href="/new">
      <IconButton
        variant="unstyled"
        icon={<AttachmentIcon />}
        aria-label="Create file"
      />
    </Link>
  );
};
