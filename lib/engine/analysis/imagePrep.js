// imagePrep.js - downscale screenshots for vision LLM analysis (full-res stays in R2)

import sharp from "sharp";
import {
  AUDIT_ANALYSIS_HERO_IMAGE_MAX_WIDTH,
  AUDIT_ANALYSIS_IMAGE_MAX_WIDTH,
  AUDIT_ANALYSIS_IMAGE_QUALITY
} from "../config.js";

/**
 * Fetch or accept a buffer, resize for API, return base64 JPEG for vision models.
 * @param {string|Buffer|null} imageInput - public URL or PNG buffer
 * @param {{ isHero?: boolean }} [options]
 * @returns {Promise<{ kind: 'base64', mediaType: 'image/jpeg', data: string }|null>}
 */
export async function prepareImageForAnalysis(imageInput, options = {}) {
  if (!imageInput) return null;

  const isHero = options.isHero === true;
  const maxWidth = isHero
    ? AUDIT_ANALYSIS_HERO_IMAGE_MAX_WIDTH
    : AUDIT_ANALYSIS_IMAGE_MAX_WIDTH;

  let buffer;
  if (Buffer.isBuffer(imageInput)) {
    buffer = imageInput;
  } else if (typeof imageInput === "string") {
    const response = await fetch(imageInput);
    if (!response.ok) {
      throw new Error(`Failed to fetch screenshot (${response.status})`);
    }
    buffer = Buffer.from(await response.arrayBuffer());
  } else {
    return null;
  }

  const resized = await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: AUDIT_ANALYSIS_IMAGE_QUALITY, mozjpeg: true })
    .toBuffer();

  return {
    kind: "base64",
    mediaType: "image/jpeg",
    data: resized.toString("base64")
  };
}
