import { joinURL } from "ufo";
import { createOperationsGenerator } from "@nuxt/image/dist/runtime/utils/index";
import type { ProviderGetImage } from "@nuxt/image";
import { Buffer } from "buffer";

// https://docs.imgproxy.net/
const operationsGenerator = createOperationsGenerator({
  keyMap: {
    resize: "rs",
    size: "s",
    fit: "rt",
    width: "w",
    height: "h",
    dpr: "dpr",
    enlarge: "el",
    extend: "ex",
    gravity: "g",
    crop: "c",
    padding: "pd",
    trim: "t",
    rotate: "rot",
    quality: "q",
    maxBytes: "mb",
    background: "bg",
    backgroundAlpha: "bga",
    blur: "bl",
    sharpen: "sh",
    watermark: "wm",
    preset: "pr",
    cacheBuster: "cb",
    stripMetadata: "sm",
    stripColorProfile: "scp",
    autoRotate: "ar",
    filename: "fn",
    format: "f",
  },
  formatter: (key, value) => `${key}:${value}`,
});

function urlSafeBase64(string: string) {
  return Buffer.from(string, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const defaultModifiers = {
  // fit: "fill",
  // width: 0,
  // height: 0,
  // gravity: "no",
  // enlarge: 1,
  // format: "webp",
};

/**
 * 
 * @see https://github.com/nuxt/image/issues/378
 */
export const getImage: ProviderGetImage = (src, options) => {

  // Skip if src is a relative URL
  if (src.startsWith("/")) {
    return { url: src };
  }

  // Skip GIFs, since imgproxy doesn't support them
  if (src.endsWith(".gif")) {
    return { url: src };
  }

  const { modifiers, baseURL } = options;

  const mergeModifiers = { ...defaultModifiers, ...modifiers };

  const encodedUrl = urlSafeBase64(src);

  const path = joinURL("/", operationsGenerator(mergeModifiers), encodedUrl);

  return {
    url: joinURL(baseURL, path),
  };
};
