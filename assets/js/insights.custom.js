import { track } from "insights-js";

let defaultSettings = {
  darkTheme: {
    value: false
  },
  infiniteLoad: {
    value: false
  },
  fullSizeImages: {
    value: false
  },
  score: {
    value: 0
  },
  videoControls: {
    value: false
  },
  hoverControls: {
    value: false
  },
  zoom: {
    value: false
  },
  nsfw: {
    value: true
  }
};

/* -------- Analytics -------- */
export default async function fireAnalytics(type, data) {
  const debug = process.env.NODE_ENV !== "production";
  // console.log("Analytics fired with something:", type, data);

  // !debug
  if (!debug) {
    // Track searched tags
    if (type === "tags") {
      // console.log("Tag analytics fired:", data);

      if (data.length > 0) {
        Object.keys(data).forEach(function(key) {
          // console.log(key, data[key]);
          track({
            id: "user-usage",
            parameters: {
              searchedTags: data[key]
            }
          });
        });

        return Promise.resolve("Tags executed succesfully");
      }

      return Promise.resolve("Tags didnt execute");

      // Track different than default settings
    } else if (type === "settings") {
      // console.log("Settings analytics fired:", data);

      // Extract differences
      let difference = Object.keys(data).filter(
        key => data[key].value !== defaultSettings[key].value
      );

      if (difference.length > 0) {
        // console.log("There are changed settings", difference);

        Object.keys(difference).forEach(function(key) {
          // console.log(key, difference[key]);
          track({
            id: "user-usage",
            parameters: {
              userSettings: difference[key]
            }
          });
        });
        return Promise.resolve("Settings executed succesfully");
      }
      return Promise.resolve("Settings didnt execute");
    }
    return Promise.resolve("Nothing executed");
  }
  return Promise.resolve("Not in production");
}
