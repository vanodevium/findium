#! /usr/bin/env node

import ora from "ora";
import parseCommandLineArgs from "./parseCommandLineArgs.js";
import validateCLIArguments from "./validateCLIArguments.js";
import findium from "./main.js";

const preloader = ora({ text: "Loading results", color: "cyan" }).start();

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
