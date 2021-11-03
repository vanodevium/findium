const optionDefinitions = [
  // the query that should be sent to the Google search
  { name: "query", alias: "q", type: String },

  // name of the JSON file to save results to
  { name: "output", alias: "o", type: String },

  // prevent results from appearing in the terminal output. Should only be used
  // with --output (-o) command when saving results to a file
  { name: "no-display", alias: "n", type: Boolean },

  // number of search results to be returned
  { name: "limit", alias: "l", type: Number },

  // enable pagination by choosing which result to start at
  { name: "start", type: Number },

  // only display the URLs, instead of the titles and snippets
  { name: "only-urls", alias: "u", type: Boolean },

  // option to open the first X number of results directly in browser
  // (only tested on Mac!).
  { name: "open", alias: "O", type: Number },

  // option to save the html file of the Google search result page
  { name: "htmlFileOutputPath", alias: "h", type: String },

  // option to use specific HTML file to parse, one that might exist locally
  // for example, main for debugging purposes
  { name: "fromFile", alias: "f", type: String },

  // override the hard-coded selectors defined inside /src/utils.js
  { name: "titleSelector", type: String },
  { name: "linkSelector", type: String },
  { name: "snippetSelector", type: String },

  // allows for findium result object to include raw network request's response
  { name: "diagnostics", alias: "d", type: Boolean },

  // modifies the search query by adding "site:" operator for each comma-separated value,
  // combined with OR operator when there are multiple values
  { name: "include-sites", type: String },

  // modifies the search query by adding "-site:" operator for each comma-separated value,
  // combined with AND operator when there are multiple values
  { name: "exclude-sites", type: String },
];

module.exports = optionDefinitions;
