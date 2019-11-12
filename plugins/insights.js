import { init, trackPages } from "insights-js";

const debug = process.env.NODE_ENV !== "production";

/* -------- Analytics -------- */
if (!debug) {
  init("lM7bTMlOwFtKXoMJ");
  trackPages({ options: { search: true, hash: true } });
}
