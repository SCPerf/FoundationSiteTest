import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import * as xmcloud from "./sitecore/xmcloud.js"
import exec from 'k6/execution';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import http from 'k6/http'
import * as Helper from "./helper.js"
import { writeDataToAzureTable } from './sitecore/common/azuretableutilities.js'
import { GetRunId } from './sitecore/common/common.js'
import {StorageAccount, StorageKey, RebuildTableName} from './sitecore/common/globalSettings.js'

// External Files
const cmEndpoints = JSON.parse(open('./cmhost.json'))

// Define Counters
var IndexRebuildTrend = new Trend("Index_Rebuild_Trend", true);
var NumberIndexRebuildsCount = new Counter("Number_Index_Rebuilds");

export const options = {
    scenarios: {
        rebuild: {
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '60m',
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
    runInfo["polling"] = Helper.GetNumberCliSetting("polling", 5);
    runInfo["RunId"] = runId;
    runInfo["StorageAccount"] = StorageAccount();
    runInfo["StorageKey"] = StorageKey();
    runInfo["RebuildStorageTable"] = RebuildTableName();
    xmcloud.Debug(`(${exec.vu.idInTest}) Results Storage Account: ${runInfo["StorageAccount"]}`)
    xmcloud.Debug(`(${exec.vu.idInTest}) Results Storage Table: ${runInfo["RebuildStorageTable"]}`)
    return runInfo
}

/**
 * Default Entrypoint.
 * @param {object} data The run data object, generated in setup.
 */
export default function (data) {
    RebuildIndex(data)
}

/**
 * Rebuilds a Sitecore index.
 * @param {object} data Configuration data for the test
 */
export function RebuildIndex(data) {
    let rebuildUrls = [];
    let handles = {};
    let endPoints = cmEndpoints.length;
    
    for (let index = 0; index < cmEndpoints.length; index++) {
        const rebuildUrl = `https://${cmEndpoints[index]}/performance/search/rebuild`
        rebuildUrls.push(rebuildUrl)
    }

    // Rebuild on all hosts
    const responses = http.batch(rebuildUrls)
    
    for (let index = 0; index < responses.length; index++) {
        check(responses[index], {
            'Rebuild Index Response was 200': (res) => res.status === 200,
        })

        if (responses[index].status !== 200) {
            xmcloud.Debug(`(${exec.vu.idInTest}) - ${responses[index].url} was not 200.`)
        }

        var host = new URL(responses[index].url).host
        var rebuildIndex = JSON.parse(responses[index].body);
        var rebuildStart = parseJsonDate(rebuildIndex.EventTime)

        // Check if call was successful
        if (!(rebuildIndex.Success)) {
            xmcloud.Debug(`(${exec.vu.idInTest}) - ${responses[index].url} failed to start rebuild.`)
        }

        // Check if indexing is rebuilding state
        if (!rebuildIndex.Rebuilding) {
            xmcloud.Debug(`(${exec.vu.idInTest}) - ${responses[index].url} did not go into rebuild state.`)
        }

        xmcloud.Debug(`(${exec.vu.idInTest}) - ${responses[index].url} Rebuild Started: ${rebuildStart}`)

        var rebuildItem = {
            host: host,
            handle: rebuildIndex.Handle,
            startTime: rebuildIndex.EventTime
        }

        handles[host] = rebuildItem
    }

    // Loop Until Rebuild Index completed for each host
    do {
        let statusUrls = [];
        for (let statusIndex = 0; statusIndex < Object.keys(handles).length; statusIndex++) {
            var keys = Object.keys(handles);
            var item = handles[keys[statusIndex]]
            const statusUrl = `https://${item.host}/performance/search/rebuild/status?handleString=${item.handle}`
            statusUrls.push(statusUrl)
        }
        
        // Check the Rebuild Status
        var statusResponses = http.batch(statusUrls)

        // Check response for index rebuild completion
        for (let statusResponseIndex = 0; statusResponseIndex < statusResponses.length; statusResponseIndex++) {
            check(statusResponses[statusResponseIndex], {
                'Rebuild Status Response was 200': (res) => res.status === 200,
            })

            if (statusResponses[statusResponseIndex].status !== 200) {
                xmcloud.Debug(`(${exec.vu.idInTest}) - ${statusResponses[index].url} failed to obtain rebuild status.`)
            }

            var rebuildStatus = JSON.parse(statusResponses[statusResponseIndex].body);
            var statusHost = new URL(statusResponses[statusResponseIndex].url).host
            var eventTime = parseJsonDate(rebuildStatus.EventTime);

            if (!(rebuildStatus.Success))
            {
                xmcloud.Debug(`(${exec.vu.idInTest}) - ${statusResponses[statusResponseIndex].url} rebuild status failed.`)
            }

            if (!(rebuildStatus.Rebuilding)) {
                // xmcloud.Debug(`(${exec.vu.idInTest}) - ${statusHost} Rebuild Start: ${parseJsonDate(handles[statusHost].startTime)}.`);
                // xmcloud.Debug(`(${exec.vu.idInTest}) - ${statusHost} Rebuild Complete: ${eventTime}.`);

                var baseImageVersion = "";
                var baseImageVersionUrl = `https://${item.host}/performance/version`;
                var versionInformation = http.get(baseImageVersionUrl);
                if (versionInformation.status == 200) {
                    var versionJson = JSON.parse(versionInformation.body);
                    baseImageVersion = versionJson.Log[1].Message.replace("FullName: Sitecore XMCloud ", "").replace("(rev. 0)", "")
                }

                var startTime = parseJsonDate(handles[statusHost].startTime);
                var indexTime = CalculateTime(startTime, eventTime);
                xmcloud.Debug(`(${exec.vu.idInTest}) - ${statusHost} Rebuild Duration: ${indexTime}.`);
                IndexRebuildTrend.add(indexTime);
                NumberIndexRebuildsCount.add(1);

                var result = generateRebuildRecord(data.RunId, baseImageVersion, endPoints, indexTime, startTime.toISOString(), eventTime.toISOString());
                writeDataToAzureTable(result, data.StorageAccount, data.StorageKey, data.RebuildStorageTable)

                delete handles[statusHost];
            }
        }

        if (Object.keys(handles).length > 0) {
            // xmcloud.Debug(`(${exec.vu.idInTest}) - Waiting ${data.polling}s for Index to complete......`);
            sleep(data.polling)
        }
    } while (Object.keys(handles).length > 0)
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
    };
}

/**
 * Converts Json date to a Javascript date
 * @param {string} jsonDateString JSON date string
 * @returns Date
 */

function parseJsonDate(jsonDateString){
    return new Date(parseInt(jsonDateString.replace('/Date(', '')));
}

/**
 * Calculates the time period from 2 times.
 * @param {date} startTime Start time.
 * @param {date} endTime End time.
 * @returns 
 */
function CalculateTime(startTime, endTime) {
    if (startTime == null ||
        startTime == undefined ||
        startTime.length == 0) {
        return -1
    }

    if (endTime == null ||
        endTime == undefined ||
        endTime.length == 0) {
        return -1
    }

    var start = new Date(startTime)
    var end = new Date(endTime)
    return (end-start)
}


function generateRebuildRecord
    (
        runId,
        baseImageVersion = "",
        endpointCount,
        rebuildDuration,
        rebuildStartTime,
        rebuildCompleteIndexTime,
    )
{
    const date = new Date();
    const partitionKey = date.getFullYear() + "_" + (date.getMonth() + 1);
    const rowKey = date.getDate() + "_" + (date.getHours()) + ":" + (date.getMinutes()) + ":" + (date.getSeconds()) + "_" + exec.vu.idInTest;

    const data = {
        PartitionKey: partitionKey,
        RowKey: rowKey,
        runid: runId,
        date: date.toISOString(),
        baseImageVersion: baseImageVersion,
        endpointCount: endpointCount,
        rebuildDuration: rebuildDuration,
        rebuildStartTime: rebuildStartTime,
        RebuildCompleteTime: rebuildCompleteIndexTime,
    };

    return data;
}