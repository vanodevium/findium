const fs = require("fs");

const {
  FINDIUM_TITLE_SELECTOR,
  FINDIUM_LINK_SELECTOR,
  FINDIUM_SNIPPET_SELECTOR,
  FINDIUM_RESULT_STATS_SELECTOR,
  FINDIUM_CURSOR_SELECTOR,
  FINDIUM_INCLUDE_SITES = "",
  FINDIUM_EXCLUDE_SITES = "",
} = process.env;

const defaultUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:34.0) Gecko/20100101 Firefox/34.0";

const defaultLimit = 10;
const defaultStart = 0;

/**
 * @param {string} query
 * @param {string[]|string} includeSites
 * @param {string[]|string} excludeSites
 * @returns {string}
 */
const getFullQuery = (
  query,
  includeSites = FINDIUM_INCLUDE_SITES,
  excludeSites = FINDIUM_EXCLUDE_SITES
) => {
  if (includeSites === "" && excludeSites === "") {
    return query;
  }
  if (includeSites !== "") {
    return `${query} ${includeOrExclude(includeSites, true)}`;
  }
  return `${query} ${includeOrExclude(excludeSites, false)}`;
};

const includeOrExclude = (sites, include = true) => {
  let prefix = include ? "" : "-";
  let logical = include ? "OR" : "AND";
  return sites
    .split(",")
    .map((site) => `${prefix}site:${site.trim()}`)
    .join(` ${logical} `);
};

/**
 * @typedef {Object} DefaultRequestOptionsParams
 * @property {number} limit
 * @property {string} query
 * @property {string} userAgent
 * @property {number} start
 * @property {string[]|string} includeSites
 * @property {string[]|string} excludeSites
 */

/**
 * @param {DefaultRequestOptionsParams}
 * @returns {Object}
 */
const getDefaultRequestOptions = ({
  limit,
  query,
  userAgent,
  start,
  includeSites,
  excludeSites,
}) => ({
  url: "https://www.google.com/search",
  params: {
    q: getFullQuery(query, includeSites, excludeSites),
    num: limit || defaultLimit,
    start: start || defaultStart,
  },
  headers: {
    "User-Agent": userAgent || defaultUserAgent,
  },
});

const titleSelector = "div.ZINbbc > div:nth-child(1) > a > h3";
const linkSelector = "div.ZINbbc > div:nth-child(1) > a";
const snippetSelector =
  "#main > div > div > div > div:not(.v9i61e) > div.AP7Wnd";
const resultStatsSelector = "#resultStats";
const cursorSelector = "#nav > tbody > tr > td.cur";

const getTitleSelector = (passedValue) =>
  passedValue || FINDIUM_TITLE_SELECTOR || titleSelector;

const getLinkSelector = (passedValue) =>
  passedValue || FINDIUM_LINK_SELECTOR || linkSelector;

const getSnippetSelector = (passedValue) =>
  passedValue || FINDIUM_SNIPPET_SELECTOR || snippetSelector;

const getResultStatsSelector = (passedValue) =>
  passedValue || FINDIUM_RESULT_STATS_SELECTOR || resultStatsSelector;

const getResultCursorSelector = (passedValue) =>
  passedValue || FINDIUM_CURSOR_SELECTOR || cursorSelector;

const logIt = (message, disableConsole) => {
  if (disableConsole) {
    return;
  }

  console.log(message);
};

const saveToFile = (output, results) => {
  if (output !== undefined) {
    fs.writeFile(output, JSON.stringify(results, null, 2), "utf8", (err) => {
      if (err) {
        console.error(`Error writing to file ${output}: ${err}`);
      }
    });
  }
};

const saveResponse = (response, htmlFileOutputPath) => {
  if (htmlFileOutputPath) {
    fs.writeFile(htmlFileOutputPath, response.data, () => {
      console.log(`Html file saved to ${htmlFileOutputPath}`);
    });
  }
};

module.exports = {
  defaultUserAgent,
  defaultLimit,
  defaultStart,
  getDefaultRequestOptions,
  getTitleSelector,
  getLinkSelector,
  titleSelector,
  linkSelector,
  snippetSelector,
  getSnippetSelector,
  resultStatsSelector,
  getResultStatsSelector,
  getResultCursorSelector,
  logIt,
  saveToFile,
  saveResponse,
  getFullQuery,
};
