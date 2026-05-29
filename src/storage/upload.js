import path from "path";
import fs from "fs-extra";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "./r2.js";

export async function uploadScreenshot(localFilePath, jobId, filename) {
  const buffer = await fs.readFile(localFilePath);
  const resolvedFilename = filename || path.basename(localFilePath);
  const storagePath = `jobs/${jobId}/${resolvedFilename}`;

  const bucket = process.env.STORAGE_BUCKET;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  const r2 = getR2Client();

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storagePath,
        Body: buffer,
        ContentType: "image/png"
      })
    );
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const normalizedBase = publicBaseUrl ? publicBaseUrl.replace(/\/+$/, "") : "";
  const publicUrl = normalizedBase ? `${normalizedBase}/${storagePath}` : null;

  await fs.remove(localFilePath);

  return { storagePath, publicUrl };
}

export async function uploadMany(fileArray, jobId) {
  const uploads = fileArray.map((file) => uploadScreenshot(file.localPath, jobId, file.filename));
  return Promise.all(uploads);
}
