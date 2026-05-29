// r2.js - uploads screenshots to Cloudflare R2 and returns storage paths and public URLs

import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { getR2Client } from "../../../src/storage/r2.js";
import { R2_BUCKET } from "../config.js";

function buildKey(jobId, filename) {
  return `audits/${jobId}/${filename}`;
}

function buildPublicUrl(key) {
  const base = (
    process.env.R2_PUBLIC_URL ||
    process.env.R2_PUBLIC_BASE_URL ||
    ""
  ).replace(/\/+$/, "");
  if (!base) {
    throw new Error(
      "Missing R2_PUBLIC_URL or R2_PUBLIC_BASE_URL in environment"
    );
  }
  return `${base}/${key}`;
}

export async function uploadScreenshot(localBuffer, jobId, filename) {
  if (!R2_BUCKET) {
    throw new Error("Missing R2_BUCKET_NAME in environment");
  }

  const r2Key = buildKey(jobId, filename);
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: r2Key,
      Body: localBuffer,
      ContentType: "image/png"
    })
  );

  return {
    r2Key,
    publicUrl: buildPublicUrl(r2Key)
  };
}

export async function uploadMany(files, jobId) {
  const uploads = files.map(async ({ buffer, filename }) => {
    const result = await uploadScreenshot(buffer, jobId, filename);
    return { ...result, filename };
  });

  return Promise.all(uploads);
}

export async function deleteJobFiles(jobId) {
  if (!R2_BUCKET) {
    throw new Error("Missing R2_BUCKET_NAME in environment");
  }

  const prefix = `audits/${jobId}/`;
  const client = getR2Client();
  let continuationToken;
  let deletedCount = 0;

  do {
    const listed = await client.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken
      })
    );

    const objects = (listed.Contents || []).map((object) => ({ Key: object.Key }));

    if (objects.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET,
          Delete: { Objects: objects, Quiet: true }
        })
      );
      deletedCount += objects.length;
    }

    continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (continuationToken);

  return { deletedCount };
}
