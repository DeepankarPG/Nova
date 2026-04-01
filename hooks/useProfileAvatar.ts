"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "payglocal-profile-avatar-v1";

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(dataUrl: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (dataUrl) sessionStorage.setItem(STORAGE_KEY, dataUrl);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Quota or private mode
  }
}

function fileToResizedDataUrl(file: File, maxEdge = 256, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const scale = Math.min(1, maxEdge / Math.max(w, h));
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unsupported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };
    img.src = url;
  });
}

export function useProfileAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setAvatarUrl(readStored());
  }, []);

  const setFromFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Not an image");
    }
    const dataUrl = await fileToResizedDataUrl(file);
    writeStored(dataUrl);
    setAvatarUrl(dataUrl);
  }, []);

  const clear = useCallback(() => {
    writeStored(null);
    setAvatarUrl(null);
  }, []);

  return { avatarUrl, setFromFile, clear };
}
