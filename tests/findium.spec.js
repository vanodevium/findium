/* eslint-disable no-console */
import open from "open";
import { readFileSync, readFile } from "fs";
import axios from "axios";
import path from "path";
import {
  errorTryingToOpen,
  openInBrowser,
  getSnippet,
  display,
  getResults,
  getResponse,
} from "../src/findium.js";

import * as utils from "../src/utils.js";

const { logIt } = utils;

global.console = {
  ...global.console,
  log: jest.fn(),
};

jest.mock("open", () => jest.fn(() => {}));

jest.mock("../src/utils.js", () => ({
  ...jest.requireActual("../src/utils.js"),
  logIt: jest.fn(() => {}),
}));

jest.spyOn(utils, "getDefaultRequestOptions");

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFile: jest.fn((filePath, callback) => callback()),
}));

jest.mock("axios", () => jest.fn(() => Promise.resolve({ data: true })));

describe("errorTryingToOpen", () => {
  it("does not call console.log when error is falsy", () => {
    console.log.mockClear();
    errorTryingToOpen(false);
    expect(console.log).not.toHaveBeenCalled();
  });

  it("calls console.log 3 times when error is true", () => {
    console.log.mockClear();
    errorTryingToOpen("something really bad", "stdout", "stderr");
    expect(console.log).toHaveBeenCalledTimes(3);
  });
});

describe("openInBrowser", () => {
  it('does not call exec when "open" is undefined', () => {
    open.mockClear();
    openInBrowser(undefined);
    expect(open).not.toHaveBeenCalled();
  });

  it('calls exec results.slice(0, open).length times when "open" is > 0', () => {
    open.mockClear();
    openInBrowser(3, [{ link: "" }, { link: "" }, { link: "" }]);
    expect(open).toHaveBeenCalledTimes(3);
  });
});

describe("getSnippet", () => {
  it("maps over elem.children and data field, joined by empty string", () => {
    const result = getSnippet({
      children: [{ data: "1" }, { data: "2" }, { data: "3" }],
    });
    expect(result).toBe("123");
  });

  it("returns child.children.map(c => c.data) when child.data does not exist", () => {
    const result = getSnippet({
      children: [
        { children: [{ data: "1" }] },
        { children: [{ data: "2" }] },
        { children: [{ data: "3" }] },
      ],
    });
    expect(result).toBe("123");
  });
});

describe("getSnippet (recursive)", () => {
  it("maps over elem.children and data field, recursively, joined by empty string", () => {
    const result = getSnippet({
      children: [{ data: "1" }, { children: [{ data: "2" }] }, { data: "3" }],
    });
    expect(result).toBe("123");
  });

  it("returns child.children.map(c => c.data) when child.data does not exist", () => {
    const result = getSnippet({
      children: [
        { children: [{ data: "1" }] },
        { children: [{ children: [{ data: "2" }] }] },
        { children: [{ data: "3" }] },
      ],
    });
    expect(result).toBe("123");
  });
});

describe("getSnippet (empty)", () => {
  it("maps over empty elem.children", () => {
    const result = getSnippet({});
    expect(result).toBe("");
  });

  it("returns empty string when children does not exist", () => {
    const result = getSnippet({
      children: [],
    });
    expect(result).toBe("");
  });
});

describe("display", () => {
  it("calls logIt once for each result (+ once for newline) when 3rd arg (onlyUrls) is true", () => {
    logIt.mockClear();
    display([{ link: "a" }, { link: "b" }], false, true);
    expect(logIt).toHaveBeenCalledTimes(3);
  });

  it("calls logIt 4 times for each result (+ once for newline) when 3rd arg is false", () => {
    logIt.mockClear();
    display(
      [
        { title: "a", link: "a", snippet: "a" },
        { title: "b", link: "b", snippet: "b" },
      ],
      false,
      false,
    );
    expect(logIt).toHaveBeenCalledTimes(9);
  });

  it("calls logIt once for each result (+ once for newline) when 3rd arg (onlyUrls) is false but title is missing", () => {
    logIt.mockClear();
    display(
      [
        { link: "a", snippet: "a" },
        { link: "b", snippet: "b" },
      ],
      false,
      false,
    );
    expect(logIt).toHaveBeenCalledTimes(3);
  });
});

const getTestResults = (filePath) => {
  const htmlPageData = readFileSync(path.resolve(__dirname, filePath), "utf8");
  const { results } = getResults({ data: htmlPageData });
  return results;
};

describe("getResults", () => {
  it("returns the correct number of results", () => {
    const results = getTestResults("./data/miter-saws.html.js");
    expect(results.length).toBe(9);
  });

  it("does not crash when results, result stats section, or cursor section of page are present", () => {
    const results = getTestResults("./data/no-matching-documents.html.js");
    expect(results.length).toBe(0);
  });
});

describe("getResponse", () => {
  it("calls fs.readFile when `fromFile` argument is passed", () => {
    getResponse({ fromFile: "/path/to/file", query: "fooBarBaz9001" });
    expect(readFile).toHaveBeenCalled();
  });

  it("calls `request` when `fromFile` argument is not passed", () => {
    getResponse({ query: "fooBarBaz9001" });
    expect(axios).toHaveBeenCalled();
  });

  it("rejects with error when call to request returns with error", () => {
    axios.mockImplementation((args, callback) => callback(true, {}, {}));
    getResponse({ query: "fooBarBaz9001" }).catch((error) => {
      expect(error !== null).toBe(true);
    });
  });

  it("calls neither fs.readFile nor getDefaultRequestOptions when fromString option passed", () => {
    jest.clearAllMocks();
    getResponse({
      fromString:
        '<html lang="en">This does not actually exist. So what. It is only a test.</html>',
    });
    expect(axios).toHaveBeenCalledTimes(0);
    expect(readFile).toHaveBeenCalledTimes(0);
  });
});
