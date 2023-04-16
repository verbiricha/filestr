// Yoinked from snort.social codebase
import * as secp from "@noble/secp256k1";

interface UploadResult {
  url?: string;
  error?: string;
}

const VoidCatHost = "https://void.cat";
const FileExtensionRegex = /\.([\w]+)$/i;

/**
 * Upload file to void.cat
 * https://void.cat/swagger/index.html
 */
export async function VoidCat(
  file: File | Blob,
  filename: string
): Promise<UploadResult> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const hash = secp.utils.bytesToHex(new Uint8Array(digest));

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
        ...rsp,
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
