"use client";

import { useCallback, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";

// Client hook that POSTs image files to /api/uploads one at a time and returns
// their stored relative paths. Tracks an uploading flag and a localized error
// message so the form can show progress / failures without re-implementing the
// fetch each time.
export function useUploadScreenshot() {
  const { dictionary: copy } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadScreenshots = useCallback(
    async (fileList: FileList | null, tradeId?: string): Promise<string[]> => {
      if (!fileList || fileList.length === 0) {
        return [];
      }

      setUploadError(null);
      setUploading(true);

      const uploaded: string[] = [];

      try {
        for (const file of Array.from(fileList)) {
          const data = new FormData();
          data.append("file", file);
          if (tradeId) {
            data.append("tradeId", tradeId);
          }

          const response = await fetch("/api/uploads", {
            method: "POST",
            body: data,
          });

          if (!response.ok) {
            throw new Error(`upload failed with status ${response.status}`);
          }

          const json = (await response.json()) as { path?: unknown };

          if (typeof json.path === "string") {
            uploaded.push(json.path);
          }
        }
      } catch (error) {
        console.error("[uploads] screenshot upload failed", error);
        setUploadError(copy.tradeForm.uploadFailed);
      } finally {
        setUploading(false);
      }

      return uploaded;
    },
    [copy.tradeForm.uploadFailed],
  );

  return { uploadScreenshots, uploading, uploadError };
}
