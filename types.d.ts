export type SearchResult = {
    title: string;
    link: string;
    snippet: string;
};
export type SearchResultOnlyURLs = {
    link: string;
};
export type SearchResultStats = {
    hasNextPage: boolean;
};
export type SearchResultContainer = {
    results: SearchResult[] | SearchResultOnlyURLs[];
    stats: SearchResultStats;
};
export type FindiumConfig = {
    query?: string;
    output?: string;
    open?: boolean;
    returnHtmlBody?: boolean;
    titleSelector?: string;
    linkSelector?: string;
    snippetSelector?: string;
    resultStatsSelector?: string;
    cursorSelector?: string;
    start?: number;
    diagnostics?: boolean;
    "no-display"?: boolean;
    "only-urls"?: boolean;
    disableConsole?: boolean;
    filePath?: string;
    fromString?: string;
    options?: any;
    htmlFileOutputPath?: string;
    limit?: number;
    userAgent?: string;
    "include-sites"?: string[] | string;
    "exclude-sites"?: string[] | string;
};

export default function findium(config: FindiumConfig): Promise<SearchResult[] | SearchResultOnlyURLs[] | SearchResultContainer>;
