#! /usr/bin/env node

const ora = require("ora");

const preloader = ora({ text: "Loading results", color: "cyan" }).start();
const parseCommandLineArgs = require("./parseCommandLineArgs");
const validateCLIArguments = require("./validateCLIArguments");
const findium = require("./main");

const cliOptions = parseCommandLineArgs(process.argv);
const validation = validateCLIArguments(cliOptions);
if (!validation.valid) {
  preloader.stop().clear();
  console.log(`Invalid options. Error:  ${validation.error}`);
} else {
  findium(cliOptions)
    .then(() => {
      preloader.stop().clear();
    })
    .catch((e) => {
      preloader.stop().clear();
      console.log(e);
    });
}
