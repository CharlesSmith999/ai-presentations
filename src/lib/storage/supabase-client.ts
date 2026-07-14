import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { appConfig } from "@/config/app-config";
import { StorageError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";

const log = createLogger("lib:supabase-storage");

/**
 * Client initialization, cached so every consumer shares one instance.
 */
let client: SupabaseClient | undefined;

export function getSupabaseStorageClient(): SupabaseClient {
  if (!client) {
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return client;
}

/**
 * Uploads a generated presentation file. This is the first real storage
 * operation in the codebase — added alongside the presentation-consulting
 * feature that needs it, rather than speculatively in Sprint 0.
 */
export async function uploadPresentationFile(path: string, fileBuffer: Buffer): Promise<{ path: string }> {
  const { error } = await getSupabaseStorageClient()
    .storage.from(appConfig.storage.bucket)
    .upload(path, fileBuffer, {
      contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      upsert: true,
    });

  if (error) {
    log.error({ err: error, path }, "Failed to upload presentation file to Supabase Storage");
    throw new StorageError("Failed to store generated presentation", { cause: error });
  }

  return { path };
}

export async function getSignedDownloadUrl(path: string): Promise<string> {
  const { data, error } = await getSupabaseStorageClient()
    .storage.from(appConfig.storage.bucket)
    .createSignedUrl(path, appConfig.storage.signedUrlTtlSeconds);

  if (error || !data) {
    log.error({ err: error, path }, "Failed to create signed URL for presentation file");
    throw new StorageError("Failed to generate a download link", { cause: error });
  }

  return data.signedUrl;
}
