// Yoinked from snort.social codebase
import * as secp from "@noble/secp256k1";

interface UploadResult {
  url?: string;
  error?: string;
}

const VoidCatHost = "https://void.cat";
const FileExtensionRegex = /\.([\w]+)$/i;

async function fileHash(buf) {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return secp.utils.bytesToHex(new Uint8Array(digest));
}

// Void.cat

/**
 * Upload file to void.cat
 * https://void.cat/swagger/index.html
 */
export async function VoidCat(
  file: File | Blob,
  filename: string
): Promise<UploadResult> {
  const buf = await file.arrayBuffer();
  const hash = await fileHash(buf);

  const req = await fetch(`${VoidCatHost}/upload`, {
    mode: "cors",
    method: "POST",
    body: buf,
    headers: {
      "Content-Type": "application/octet-stream",
      "V-Content-Type": file.type,
      "V-Filename": filename,
      "V-Full-Digest": hash,
      "V-Description": "Upload from filestr",
      //todo: fails a lot
      //"V-Strip-Metadata": "true",
    },
  });

  if (req.ok) {
    const rsp: VoidUploadResponse = await req.json();
    if (rsp.ok) {
      let ext = filename.match(FileExtensionRegex);
      if (rsp.file?.metadata?.mimeType === "image/webp") {
        ext = ["", "webp"];
      }
      return {
        url:
          rsp.file?.metadata?.url ??
          `${VoidCatHost}/d/${rsp.file?.id}${ext ? `.${ext[1]}` : ""}`,
        metadata: {
          hash,
          mimeType: rsp.file?.metadata?.mimeType || file.type,
          size: file.size,
        },
        torrent: {
          magnetLink: rsp.file?.metadata?.magnetLink,
        },
      };
    } else {
      return {
        error: rsp.errorMessage,
      };
    }
  }
  return {
    error: "Upload failed",
  };
}

export type VoidUploadResponse = {
  ok: boolean;
  file?: VoidFile;
  errorMessage?: string;
};

export type VoidFile = {
  id: string;
  metadata?: VoidFileMeta;
};

export type VoidFileMeta = {
  version: number;
  id: string;
  name?: string;
  size: number;
  uploaded: Date;
  description?: string;
  mimeType?: string;
  digest?: string;
  url?: string;
  expires?: Date;
  storage?: string;
  encryptionParams?: string;
};

// Nostr.build

export async function NostrBuild(file: File | Blob): Promise<UploadResult> {
  const buf = await file.arrayBuffer();
  const hash = await fileHash(buf);

  const fd = new FormData();
  fd.append("fileToUpload", file);
  fd.append("submit", "Upload Image");

  const rsp = await fetch("https://nostr.build/api/upload/snort.php", {
    body: fd,
    method: "POST",
    headers: {
      accept: "application/json",
    },
  });
  if (rsp.ok) {
    const data = await rsp.json();
    return {
      url: new URL(data).toString(),
      metadata: {
        hash,
        mimeType: file.type,
        size: file.size,
      },
    };
  }
  return {
    error: "Upload failed",
  };
}

// Nostr.img

export async function NostrImg(file: File | Blob): Promise<UploadResult> {
  const buf = await file.arrayBuffer();
  const hash = await fileHash(buf);

  const fd = new FormData();
  fd.append("image", file);

  const rsp = await fetch("https://nostrimg.com/api/upload", {
    body: fd,
    method: "POST",
    headers: {
      accept: "application/json",
    },
  });
  if (rsp.ok) {
    const data: UploadResponse = await rsp.json();
    if (typeof data?.imageUrl === "string" && data.success) {
      return {
        url: new URL(data.imageUrl).toString(),
        metadata: {
          hash,
          mimeType: file.type,
          size: file.size,
        },
      };
    }
  }
  return {
    error: "Upload failed",
  };
}

interface UploadResponse {
  fileID?: string;
  fileName?: string;
  imageUrl?: string;
  lightningDestination?: string;
  lightningPaymentLink?: string;
  message?: string;
  route?: string;
  status: number;
  success: boolean;
  url?: string;
  data?: {
    url?: string;
  };
}
