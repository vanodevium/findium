/* eslint-disable no-extra-parens */
/* eslint-disable no-console */

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

// NOTE:
// I chose the User-Agent value from http://www.browser-info.net/useragents
// Not setting one causes Google search to not display results
const defaultUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:34.0) Gecko/20100101 Firefox/34.0";

const defaultLimit = 10;
const defaultStart = 0;

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
    fs.writeFile(htmlFileOutputPath, response.body, () => {
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
