import { createClient } from "@supabase/supabase-js";

export const orderFileBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "order-files";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function uploadOrderFile(input: {
  orderId: string;
  fileName: string;
  mimeType?: string;
  bytes: ArrayBuffer;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("缺少 SUPABASE_SERVICE_ROLE_KEY，无法上传文件到 Supabase Storage");
  }
  const bucket = await supabase.storage.getBucket(orderFileBucket);
  if (bucket.error) {
    const created = await supabase.storage.createBucket(orderFileBucket, {
      public: false,
      fileSizeLimit: null
    });
    if (created.error) {
      throw new Error(created.error.message);
    }
  } else {
    const updated = await supabase.storage.updateBucket(orderFileBucket, {
      public: false,
      fileSizeLimit: null
    });
    if (updated.error) {
      throw new Error(updated.error.message);
    }
  }
  const safeName = input.fileName.replace(/[^\w.\-\u4e00-\u9fa5]/g, "_");
  const key = `${input.orderId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(orderFileBucket).upload(key, input.bytes, {
    contentType: input.mimeType || "application/octet-stream",
    upsert: false
  });
  if (error) {
    throw new Error(error.message);
  }
  const signed = await supabase.storage.from(orderFileBucket).createSignedUrl(key, 60 * 60 * 24 * 7);
  return {
    key,
    url: signed.data?.signedUrl ?? key
  };
}
