// Yoinked from snort.social codebase
import * as secp from "@noble/secp256k1";
import base32Decode from "base32-decode";

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

/**
 * Parse a magnet URI and return an object of keys/values
 */
export function magnetURIDecode(uri: string): Magnet | undefined {
  try {
    const result: Record<
      string,
      string | number | number[] | string[] | undefined
    > = {
      raw: uri,
    };

    // Support 'magnet:' and 'stream-magnet:' uris
    const data = uri.trim().split("magnet:?")[1];

    const params = data && data.length > 0 ? data.split("&") : [];

    params.forEach((param) => {
      const split = param.split("=");
      const key = split[0];
      const val = decodeURIComponent(split[1]);

      if (!result[key]) {
        result[key] = [];
      }

      switch (key) {
        case "dn": {
          (result[key] as string[]).push(val.replace(/\+/g, " "));
          break;
        }
        case "kt": {
          val.split("+").forEach((e) => {
            (result[key] as string[]).push(e);
          });
          break;
        }
        case "ix": {
          (result[key] as number[]).push(Number(val));
          break;
        }
        case "so": {
          // todo: not implemented yet
          break;
        }
        default: {
          (result[key] as string[]).push(val);
          break;
        }
      }
    });

    // Convenience properties for parity with `parse-torrent-file` module
    let m;
    if (result.xt) {
      const xts = Array.isArray(result.xt) ? result.xt : [result.xt];
      xts.forEach((xt) => {
        if (typeof xt === "string") {
          if ((m = xt.match(/^urn:btih:(.{40})/))) {
            result.infoHash = [m[1].toLowerCase()];
          } else if ((m = xt.match(/^urn:btih:(.{32})/))) {
            const decodedStr = base32Decode(m[1], "RFC4648-HEX");
            result.infoHash = [bytesToHex(new Uint8Array(decodedStr))];
          } else if ((m = xt.match(/^urn:btmh:1220(.{64})/))) {
            result.infoHashV2 = [m[1].toLowerCase()];
          }
        }
      });
    }

    if (result.xs) {
      const xss = Array.isArray(result.xs) ? result.xs : [result.xs];
      xss.forEach((xs) => {
        if (typeof xs === "string" && (m = xs.match(/^urn:btpk:(.{64})/))) {
          if (!result.publicKey) {
            result.publicKey = [];
          }
          (result.publicKey as string[]).push(m[1].toLowerCase());
        }
      });
    }

    for (const [k, v] of Object.entries(result)) {
      if (Array.isArray(v)) {
        if (v.length === 1) {
          result[k] = v[0];
        } else if (v.length === 0) {
          result[k] = undefined;
        }
      }
    }
    return result;
  } catch (e) {
    console.warn("Failed to parse magnet link", e);
  }
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
      const magnetLink = rsp.file?.metadata?.magnetLink;
      let infoHash;
      if (magnetLink) {
        const parsedMagnet = magnetURIDecode(magnetLink);
        infoHash = parsedMagnet?.infoHash;
      }
      return {
        url:
          rsp.file?.metadata?.url ??
          `${VoidCatHost}/d/${rsp.file?.id}${ext ? `.${ext[1]}` : ""}`,
        metadata: {
          hash,
          mimeType:
            rsp.file?.metadata?.mimeType ||
            file.type ||
            "application/octet-stream",
          size: file.size,
        },
        torrent: {
          magnetLink,
          infoHash,
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
        mimeType: file.type || "application/octet-stream",
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
          mimeType: file.type || "application/octet-stream",
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
