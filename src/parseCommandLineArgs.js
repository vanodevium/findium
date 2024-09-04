import commandLineArgs from "command-line-args";

import optionDefinitions from "./optionDefinitions.js";

const parseCommandLineArgs = (argv) => {
  const cliOptions =
    argv.length === 3 ? { query: argv[2] } : commandLineArgs(optionDefinitions);
  // first arg is 'node', second is /path/to/file/app.js, third is whatever follows afterward
  if (argv.length > 2) {
    cliOptions.query = argv[2].replace("--query=", "");
  }
  return cliOptions;
};

export default parseCommandLineArgs;
