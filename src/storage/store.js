import path from "path";
import { supabase } from "./supabase.js";
import { uploadScreenshot } from "./upload.js";

export async function saveScreenshot(jobId, url, screenshotObj) {
  let storagePath = null;
  let publicUrl = null;

  if (!screenshotObj.failed && screenshotObj.localPath) {
    const filename = path.basename(screenshotObj.localPath);
    const uploadResult = await uploadScreenshot(screenshotObj.localPath, jobId, filename);
    storagePath = uploadResult.storagePath;
    publicUrl = uploadResult.publicUrl;
  }

  const payload = {
    job_id: jobId,
    url,
    type: screenshotObj.type,
    viewport: screenshotObj.viewport,
    label: screenshotObj.label,
    selector: screenshotObj.selector,
    storage_path: storagePath,
    public_url: publicUrl,
    y_start: screenshotObj.y_start,
    y_end: screenshotObj.y_end,
    clip: screenshotObj.clip,
    bounding_box: screenshotObj.boundingBox,
    confidence: screenshotObj.confidence,
    failed: screenshotObj.failed || false,
    fail_reason: screenshotObj.failReason || null
  };

  const { data, error } = await supabase.from("screenshots").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveMany(jobId, url, screenshotArray) {
  const settled = await Promise.allSettled(screenshotArray.map((item) => saveScreenshot(jobId, url, item)));

  const result = { saved: [], failed: [] };

  settled.forEach((entry, index) => {
    if (entry.status === "fulfilled") {
      result.saved.push(entry.value);
    } else {
      result.failed.push({
        index,
        error: entry.reason?.message || String(entry.reason),
        input: screenshotArray[index]
      });
    }
  });

  return result;
}
