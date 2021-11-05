import { getNextPageSelector } from "./utils";

const fs = require("fs");
const request = require("axios");
const querystring = require("querystring");
const cheerio = require("cheerio");
const openModule = require("open");
require("colors");

const {
  getDefaultRequestOptions,
  getTitleSelector,
  getLinkSelector,
  getSnippetSelector,
  logIt,
  saveToFile,
  saveResponse,
} = require("./utils");

export function errorTryingToOpen(error, stdout, stderr) {
  if (!error) {
    return;
  }

  console.log(`Error trying to open link in browser: ${error}`);
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
}

export function openInBrowser(open, results) {
  if (open !== undefined) {
    // open is the first X number of links to open
    results.slice(0, open).forEach((result) => {
      try {
        openModule(result.link);
      } catch (e) {
        errorTryingToOpen(e);
      }
    });
  }
}

function findData(child) {
  if (!child.data) {
    return child.children.map((c) => c.data || findData(c));
  }
  return child.data;
}

export function getSnippet(elem) {
  return elem.children && elem.children.length
    ? elem.children.map((child) => Array(findData(child)).join("")).join("")
    : "";
}

export function display(results, disableConsole, onlyUrls) {
  logIt("\n", disableConsole);
  results.forEach((result) => {
    if (onlyUrls) {
      logIt(result.link.green, disableConsole);
    } else if (result.title) {
      logIt(result.title.blue, disableConsole);
      logIt(result.link.green, disableConsole);
      logIt(result.snippet, disableConsole);
      logIt("\n", disableConsole);
    } else {
      logIt("Result title is undefined.");
    }
  });
}

export const parseGoogleSearchResultUrl = (url) => {
  if (!url) {
    return undefined;
  }
  if (url.charAt(0) === "/") {
    return querystring.parse(url).url;
  }
  return url;
};

export function getResults({
  data,
  noDisplay,
  disableConsole,
  onlyUrls,
  titleSelector,
  linkSelector,
  snippetSelector,
  nextPageSelector,
}) {
  const $ = cheerio.load(data);
  let results = [];

  const titles = $(getTitleSelector(titleSelector)).contents();
  titles.each((index, elem) => {
    if (elem.data) {
      results.push({ title: elem.data });
    } else {
      results.push({ title: elem.children[0].data });
    }
  });

  $(getLinkSelector(linkSelector)).map((index, elem) => {
    if (index < results.length) {
      results[index] = Object.assign(results[index], {
        link: parseGoogleSearchResultUrl(elem.attribs.href),
      });
    }
  });

  $(getSnippetSelector(snippetSelector)).map((index, elem) => {
    if (index < results.length) {
      results[index] = Object.assign(results[index], {
        snippet: getSnippet(elem),
      });
    }
  });

  if (onlyUrls) {
    results = results.map((r) => ({ link: r.link }));
  }
  if (!noDisplay) {
    display(results, disableConsole, onlyUrls);
  }

  const hasNextPage = !!$(getNextPageSelector(nextPageSelector)).find(
    'a:contains(">")'
  ).length;

  const stats = {
    hasNextPage,
  };
  return { results, stats };
}

/**
 * @typedef {Object} GetResponseParams
 * @property {string} fromFile
 * @property {string} fromString
 * @property {Object} options
 * @property {string} htmlFileOutputPath
 * @property {string} query
 * @property {number} limit
 * @property {string} userAgent
 * @property {number} start
 * @property {string[]|string} include-sites
 * @property {string[]|string} exclude-sites
 */

/**
 * @param {GetResponseParams}
 * @returns {Promise<{"body": string}>}
 */
export function getResponse({
  fromFile: filePath,
  fromString,
  options,
  htmlFileOutputPath,
  query,
  limit,
  userAgent,
  start,
  "include-sites": includeSites,
  "exclude-sites": excludeSites,
}) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return reject(
            new Error(`Error accessing file at ${filePath}: ${err}`)
          );
        }
        return resolve({ body: data });
      });
    } else if (fromString) {
      return resolve({ body: fromString });
    } else {
      const defaultOptions = getDefaultRequestOptions({
        limit,
        query,
        userAgent,
        start,
        includeSites,
        excludeSites,
      });
      request({ ...defaultOptions, ...options })
        .then((response) => {
          saveResponse(response, htmlFileOutputPath);
          return resolve({ body: response.data, response });
        })
        .catch((error) => {
          return reject(new Error(`Error making web request: ${error}`));
        });
    }
  });
}

/**
 * @typedef {Object} SearchResult
 * @property {string} title
 * @property {string} link
 * @property {string} snippet
 */

/**
 * @typedef {Object} SearchResultOnlyURLs
 * @property {string} link
 */

/**
 * @typedef {Object} SearchResultStats
 * @property {boolean} hasNextPage
 */

/**
 * @typedef {Object} SearchResultContainer
 * @property {SearchResult[]|SearchResultOnlyURLs[]} results
 * @property {SearchResultStats} stats
 */

/**
 * @typedef {Object} FindiumConfig
 * @property {string} output
 * @property {boolean} open
 * @property {boolean} returnHtmlBody
 * @property {string} titleSelector
 * @property {string} linkSelector
 * @property {string} snippetSelector
 * @property {string} resultStatsSelector
 * @property {string} cursorSelector
 * @property {number} start
 * @property {boolean} diagnostics
 * @property {boolean} no-display
 * @property {boolean} only-urls
 * @property {boolean} disableConsole
 * @property {string} filePath
 * @property {string} fromString
 * @property {Object} options
 * @property {string} htmlFileOutputPath
 * @property {string} query
 * @property {number} limit
 * @property {string} userAgent
 * @property {string[]|string} include-sites
 * @property {string[]|string} exclude-sites
 */

/**
 * @param {FindiumConfig} config
 * @returns {Promise<SearchResult[]|SearchResultOnlyURLs[]|SearchResultContainer>}
 */
export default function findium(config) {
  const {
    output,
    open,
    returnHtmlBody,
    titleSelector,
    linkSelector,
    snippetSelector,
    resultStatsSelector,
    cursorSelector,
    start,
    diagnostics,
  } = config;
  return new Promise((resolve, reject) => {
    getResponse(config)
      .then(({ body, response }) => {
        const { results, stats } = getResults({
          data: body,
          noDisplay: config["no-display"],
          disableConsole: config.disableConsole,
          onlyUrls: config["only-urls"],
          titleSelector,
          linkSelector,
          snippetSelector,
          resultStatsSelector,
          cursorSelector,
          start,
        });
        const { status } = response;
        if (results.length === 0 && status !== 200 && !diagnostics) {
          reject(
            new Error(
              `Error in response: status ${status}. 
              To see the raw response object, please set the 'diagnostics: true' (or -d if using command line)`
            )
          );
        }
        saveToFile(output, results);
        openInBrowser(open, results);
        if (returnHtmlBody || diagnostics) {
          return resolve({
            results,
            body,
            response,
            stats,
          });
        }
        return resolve(results);
      })
      .catch(reject);
  });
}
