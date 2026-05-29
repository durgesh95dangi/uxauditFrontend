import dotenv from "dotenv";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { supabase, testConnection } from "./supabase.js";
import { getR2Client, hasR2Config } from "./r2.js";

dotenv.config();

function pass(label) {
  console.log(`${label}: PASS`);
}

function fail(label, reason) {
  console.log(`${label}: FAIL${reason ? ` - ${reason}` : ""}`);
}

async function run() {
  let allPass = true;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName = process.env.STORAGE_BUCKET;
  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (url && key) {
    pass("CHECK 1 (Env vars present)");
  } else {
    allPass = false;
    fail("CHECK 1 (Env vars present)", "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing");
  }

  if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey || !hasR2Config()) {
    allPass = false;
    fail("CHECK 1B (R2 env vars present)", "Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY");
  } else {
    pass("CHECK 1B (R2 env vars present)");
  }

  try {
    await testConnection();
    pass("CHECK 2 (Supabase connection)");
  } catch (error) {
    allPass = false;
    fail("CHECK 2 (Supabase connection)", error.message);
  }

  try {
    const { error } = await supabase.from("screenshots").select("id").limit(1);
    if (error) {
      allPass = false;
      fail(
        "CHECK 3 (Table exists)",
        "Run npm run setup-db and execute SQL in Supabase SQL Editor (then retry in ~10-30s if schema cache hasn’t refreshed)"
      );
    } else {
      pass("CHECK 3 (Table exists)");
    }
  } catch (error) {
    allPass = false;
    fail("CHECK 3 (Table exists)", error.message);
  }

  try {
    const r2 = getR2Client();
    await r2.send(new HeadBucketCommand({ Bucket: bucketName }));
    pass("CHECK 4 (R2 bucket exists)");
  } catch (error) {
    allPass = false;
    fail("CHECK 4 (R2 bucket exists)", `Create bucket manually in Cloudflare R2 (${error.message})`);
  }

  try {
    if (!r2PublicBaseUrl) {
      allPass = false;
      fail("CHECK 5 (R2 public URL configured)", "Set R2_PUBLIC_BASE_URL in .env after adding public/custom domain");
    } else {
      const normalizedBase = r2PublicBaseUrl.replace(/\/+$/, "");
      const probeUrl = `${normalizedBase}/__healthcheck_public_probe__.txt`;
      const response = await fetch(probeUrl, { method: "HEAD" });

      if (response.status === 401 || response.status === 403) {
        allPass = false;
        fail("CHECK 5 (R2 public access)", "Bucket/domain is not publicly readable yet");
      } else {
        pass("CHECK 5 (R2 public access)");
      }
    }
  } catch (error) {
    allPass = false;
    fail("CHECK 5 (R2 public access)", error.message);
  }

  console.log("");
  if (allPass) {
    console.log("Setup complete. Ready to run.");
  } else {
    console.log("Fix the issues above before running.");
  }
}

run();
