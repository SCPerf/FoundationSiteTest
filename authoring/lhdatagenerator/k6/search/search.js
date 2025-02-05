import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import * as xmcloud from "./sitecore/xmcloud.js"
import exec from 'k6/execution';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import http from 'k6/http'
import { azureTableSummary } from './sitecore/common/azuretableutilities.js'
import { GetRunId } from './sitecore/common/common.js'
import {StorageAccount, StorageKey, RebuildTableName, QueryTableName} from './sitecore/common/globalSettings.js'

// External Files
const cmEndpoints = JSON.parse(open('./cmhost.json'))
const searchTerms = JSON.parse(open('./search.json'))

// Define Counters
var SearchResponseTime = new Trend("Search_Response_Time");

export const options = {
    scenarios: {
        contacts: {
            executor: 'constant-vus',
            exec: 'Query',
            vus: 2,
            duration: '10s',
        },
    },
};

/**
 * Setup the test run environment.
 * @returns Run Information.
 */
export function setup()
{
    var runInfo = xmcloud.GetRunInformation();
    var runId = GetRunId();
    xmcloud.Debug(`(${exec.vu.idInTest}) RunId: ${runId}`)
    runInfo["RunId"] = runId;
    runInfo["StorageAccount"] = StorageAccount();
    runInfo["StorageKey"] = StorageKey();
    runInfo["QueryStorageTable"] = QueryTableName();
    xmcloud.Debug(`(${exec.vu.idInTest}) Results Storage Account: ${runInfo["StorageAccount"]}`)
    xmcloud.Debug(`(${exec.vu.idInTest}) Query Results Storage Table: ${runInfo["QueryStorageTable"]}`)
    return runInfo
}

/**
 * Default Entrypoint.
 * @param {object} data The run data object, generated in setup.
 */
export default function (data) {
    Query(data)
}

export function Query(data)
{
    const searchTerm = GetRandomSearch();
    const host = GetRandomHost();
    // xmcloud.Debug(`(${exec.vu.idInTest}) Random Host: ${host} - Random Search Term: ${searchTerm}`);
    const response = http.get(`https://${host}/performance/search?search="${searchTerm}"`);
    check(response, { 'Search Response was status 200': (r) => r.status === 200 });
    SearchResponseTime.add(response.timings.duration);
    sleep(1);
}


/**
 * Creates summary output.
 * @param {object} data The run data object, generated in setup.
 * @returns Array with summary outputs.
 */
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Show the text summary to stdout...
        'summary.json': JSON.stringify(data), // and a JSON with all the details...
        'summary.txt': textSummary(data, { indent: ' ', enableColors: false }),
        'azureTable': azureTableSummary(
            data,
            {
                runid: data.setup_data.RunId,
            },
            {
                storageAccount: data.setup_data.StorageAccount,
                accessKey: data.setup_data.StorageKey,
                tableName: data.setup_data.QueryStorageTable
            }
        )
    };
}

function GetRandomHost() {
    const randomIndex = Math.floor(Math.random() * cmEndpoints.length);
    const randomHostname = cmEndpoints[randomIndex];
    return randomHostname;
}

function GetRandomSearch() {
    
    const randomIndex = Math.floor(Math.random() * searchTerms.length);
    const searchTerm = searchTerms[randomIndex];
    return searchTerm;
}