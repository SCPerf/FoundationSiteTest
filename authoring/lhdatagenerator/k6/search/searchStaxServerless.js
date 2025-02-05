import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import * as xmcloud from "./sitecore/xmcloud.js"
import exec from 'k6/execution';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import http from 'k6/http'
import * as QueryIndex from "./search.js"
import * as Index from "./rebuild.js"
import * as Helper from "./helper.js"
import { GetRunId } from './sitecore/common/common.js'
import { StorageAccount, StorageKey, RebuildTableName, SearchStaxTableName } from './sitecore/common/globalSettings.js'
import { azureTableSummary } from './sitecore/common/azuretableutilities.js'

export const options = {
    scenarios: {
        query: {
            executor: 'constant-vus',
            exec: 'Query',
            vus: 2,
            duration: '5m',
        },
        rebuild: {
            executor: 'per-vu-iterations',
            exec: 'Rebuild',
            vus: 1,
            iterations: 1,
            maxDuration: '60m',
        }
    },
};

export function setup()
{
    var runInfo = xmcloud.GetRunInformation();
    var runId = GetRunId();
    xmcloud.Debug(`(${exec.vu.idInTest}) RunId: ${runId}`)
    runInfo["polling"] = Helper.GetNumberCliSetting("polling", 5);
    runInfo["RunId"] = runId;
    runInfo["StorageAccount"] = StorageAccount();
    runInfo["StorageKey"] = StorageKey();
    runInfo["RebuildStorageTable"] = RebuildTableName();
    runInfo["SearchStaxTableName"] = SearchStaxTableName();
    xmcloud.Debug(`(${exec.vu.idInTest}) Results Storage Account: ${runInfo["StorageAccount"]}`)
    xmcloud.Debug(`(${exec.vu.idInTest}) Rebuild Results Storage Table: ${runInfo["RebuildStorageTable"]}`)
    xmcloud.Debug(`(${exec.vu.idInTest}) Search Stax Results Storage Table: ${runInfo["SearchStaxTableName"]}`)
    return runInfo
}

export function Rebuild(data) {
    Index.RebuildIndex(data);
}

export function Query(data) {
    QueryIndex.Query(data);
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
                tableName: data.setup_data.SearchStaxTableName
            }
        )
    };
}