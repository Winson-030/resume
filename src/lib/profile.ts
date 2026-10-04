/**
 * Identity facts that appear in more than one place: JSON-LD structured data,
 * the UI contact links, and the llms.txt feeds. One source, so the page and the
 * AI-facing feeds can never disagree about who this is or where to find them.
 */

export const EMAIL = "mail@winson.dev";
export const GITHUB_URL = "https://github.com/winson-030";
export const LINKEDIN_URL = "https://www.linkedin.com/in/winson-dev";
export const RESUME_URL = "https://r.easycv.cn/winsonli_jp";

/** Short brand name: og:site_name and the WebSite node. */
export const BRAND_NAME = "Winson";

/** Legal-ish full name for metadata authors/creator/publisher. */
export const FULL_NAME = "LI YONGJIE (Winson)";

/** Other renderings of the same person, for schema.org alternateName. */
export const ALTERNATE_NAMES = ["Winson", "LI YONGJIE", "李永杰"];

export const CITY = "Tokyo";
export const COUNTRY_CODE = "JP";

/** "Tokyo, Japan" — for display and prose. */
export const CITY_LABEL = `${CITY}, Japan`;

export const MAILTO = `mailto:${EMAIL}`;