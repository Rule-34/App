import { init, trackPages } from "insights-js";

const debug = process.env.NODE_ENV !== "production";

/* -------- Analytics -------- */
if (!debug) {
  init("kQrGvntXWy9eDO4h");
  trackPages();
}
