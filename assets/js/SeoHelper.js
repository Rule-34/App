"use strict";

import { capitalize } from "lodash-es";

export class SeoHelper {

  static tagArrayToTitle(tags) {

    if (!tags) {
      return undefined;
    }

    const CAPITALIZED_TAGS = tags
      .map(tag => capitalize(tag))
      .join(", ");

    return this.normalizeStringForTitle(CAPITALIZED_TAGS);
  }

  static normalizeStringForTitle(title) {
    title = title.trim()

    // Replace underscores with spaces
    title = title.replace(/_/g, ' ')

    // Replace parentheses with empty string
    title = title.replace(/\(/g, '')
    title = title.replace(/\)/g, '')

    // Replace colon with empty string
    title = title.replace(/:/g, '')

    return title
  }
}
