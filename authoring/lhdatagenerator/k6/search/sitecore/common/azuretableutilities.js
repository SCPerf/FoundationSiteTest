import http from "k6/http";
import crypto from "k6/crypto";
import encoding from 'k6/encoding';
import exec from 'k6/execution';

/**
 * K6 handleSummary for exporting summary to Azure Tables.
 * @param {*} data 
 * @param {*} extension 
 * @param {*} options 
 * @returns 
 */
function azureTableSummary(data, extension, options) {
  // Validate Objects
  if (!options.storageAccount || options.storageAccount === "" || options.storageAccount === null) {
    throw "THe options object must contain a storageAccount property."
  }
  
  if (!options.accessKey || options.accessKey === "" || options.accessKey === null) {
    throw "THe options object must contain a accessKey property."
  }

  if (!options.tableName || options.tableName === "" || options.tableName === null) {
    throw "THe options object must contain a tableName property."
  }

  const account = {};
  account.StorageAccount = options.storageAccount;
  account.AccessKey = options.accessKey;
  account.TableName = options.tableName;
  
  const dataRow = {};
  const date = new Date();
  
  // Handle Required Keys
  const partitionKey = date.getFullYear() + "_" + (date.getMonth() + 1);
  const rowKey = date.getDate() + "_" + (date.getHours()) + ":" + (date.getMinutes()) + ":" + (date.getSeconds());
  dataRow["PartitionKey"] = partitionKey;
  dataRow["RowKey"] = rowKey; 

// Extension Rows
  for (var item in extension) {
    dataRow[item] = extension[item];
  }

// Metric Rows  
  for (var metric in data.metrics) {    
    const metricName = (`${metric}_${data.metrics[metric].type}`)
      .replace(":", "_")
      .replace("{", "_")
      .replace("}", "_")
      .replace("\(", "_")
      .replace("\)", "_");
    
    if (data.metrics[metric].type == "trend") {
      dataRow[metricName] = JSON.stringify(
        {
          avg: data.metrics[metric].values.avg,
          min: data.metrics[metric].values.min,
          med: data.metrics[metric].values.med,
          max: data.metrics[metric].values.max,
          p90: data.metrics[metric].values["p(90)"],
          p95: data.metrics[metric].values["p(95)"],
        });
    }

    if (data.metrics[metric].type == "counter") {      
      dataRow[metricName] = JSON.stringify(
        {
          rate: data.metrics[metric].values.rate,
          count: data.metrics[metric].values.count
        });
    }

    if (data.metrics[metric].type == "rate") {
      dataRow[metricName] = JSON.stringify(
        {
          rate: data.metrics[metric].values.rate,
          passes: data.metrics[metric].values.passes,
          fails: data.metrics[metric].values.fails
        });
    }
  }

  // console.log(JSON.stringify(dataRow, null, 2));

  const res = writeDataToAzureTable(dataRow, account.StorageAccount, account.AccessKey, account.TableName, date)
  const summaryOutput = {};
  summaryOutput.StorageAccount = account.StorageAccount;
  summaryOutput.TableName = account.TableName;
  summaryOutput.Url = res.url;
  summaryOutput.Status = res.status;
  summaryOutput.Body = res.body;

  console.log(`Logged result to Azure Table '${summaryOutput.TableName}' using '${summaryOutput.StorageAccount}' account.`);
  return JSON.stringify(summaryOutput, null, 2)
}

/**
 * Generate Azure table requests http headers.
 * @param {string} storageAccountName Azure Table storage account name
 * @param {string} accessKey Azure Tables access key
 * @param {string} tableName Azure Tables table name
 * @param {date} date Date associated with record
 * @returns Azure Tables http headers
 */
function generateAzureTablesHeader(storageAccountName, accessKey, tableName, date) {
  const authorization = generateAzureTablesAuthorizationHeader(storageAccountName, accessKey, tableName, date);
  const headers = {
    "Accept": "application/json",
    "Authorization": authorization,
    "x-ms-date": date.toUTCString(),
    "x-ms-version": "2020-10-02",
    "Content-Type": "application/json"
  };

  return headers;
}

/**
 * 
 * @param {string} storageAccountName Azure Tables storage account name
 * @param {string} accessKey Azure Tables access key
 * @param {string} tableName Azure Tables table name
 * @param {date} date Date associated with the transaction
 * @returns Azure Tables authorization header, SAS Shared Key Lite
 */
function generateAzureTablesAuthorizationHeader(storageAccountName, accessKey, tableName, date) {
  const canonicalizedResource = "/" + storageAccountName + "/" + tableName;
  const stringToSign = `${date.toUTCString()}\n${canonicalizedResource}`;
  const encodedData = unescape(encodeURIComponent(stringToSign));
  const secret = encoding.b64decode(accessKey);
  const hash = crypto.hmac('sha256', secret, encodedData, 'base64');
  const sharedKey = `SharedKeyLite ${storageAccountName}:${hash}`;
  return sharedKey;
}

/**
 * Builds a XMDeployment Log Record
 * @param {string} runId 
 * @param {date} date 
 * @param {number} build 
 * @param {number} deployment 
 * @param {number} deploymentSubmitted 
 * @param {number} deploymentReconcile 
 * @param {number} provisioning 
 * @param {number} total 
 * @param {string} environment 
 * @param {string} region 
 * @param {string} source 
 * @param {string} testRuntimeVersion 
 * @param {string} hide 
 * @param {string} note 
 * @param {string} result 
 * @param {string} projectId 
 * @param {string} environmentId 
 * @param {string} deploymentIdSet 
 * @returns 
 */
function generateXMDeploymentDateRecord
  (
    runId,
    build,
    deployment,
    deploymentSubmitted,
    deploymentReconcile,
    provisioning,
    total,
    environment = "preprod",
    region = "weu",
    source = "SXA Template",
    testRuntimeVersion = "",
    hide = "0",
    note = "",
    result = "1",
    projectId = "",
    environmentId = "",
    deploymentIdSet = "",
    postStepTime,
    repositoryPath = "",
    tag = "",
    baseImageVersion = ""
  ) {
  
  const date = new Date();
  const partitionKey = date.getFullYear() + "_" + (date.getMonth() + 1);
  const rowKey = date.getDate() + "_" + (date.getHours()) + ":" + (date.getMinutes()) + ":" + (date.getSeconds()) + "_" + exec.vu.idInTest;

  const data = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    runid: runId,
    date: date.toISOString(),
    environment: environment,
    region: region,
    source: source,
    build: build,
    deployment: deployment,
    deployment_submitted: deploymentSubmitted,
    deployment_reconcile: deploymentReconcile,
    provisioning: provisioning,
    total: total,
    testruntimeversion: testRuntimeVersion,
    hide: hide,
    note: note,
    result: result,
    projectId: projectId,
    environmentId: environmentId,
    deploymentIdSet: deploymentIdSet,
    poststeps: postStepTime,
    repositoryPath: repositoryPath,
    tag: tag,
    baseImageVersion: baseImageVersion
  };

  return data;
}

/**
 * Generates a data object that represents an endpoint impacted by testing.
 * @param {string} uri Uri for the endpoint being tested.
 * @returns Endpoint Metric data row object
 */
function generateEndpointMetric
  (
    uri,
    verb,
    runId,
    testName,

  ) {
  
  
  if (!uri || uri === "" || uri === null) {
    throw "uri parameter is required";
  }
  
  const date = new Date();
  const partitionKey = date.getFullYear() + "_" + (date.getMonth() + 1);
  const rowKey = date.getDate() + "_" + (date.getHours()) + ":" + (date.getMinutes()) + ":" + (date.getSeconds()) + ":" + (date.getMilliseconds()) + "_" + exec.vu.idInTest;

  const data = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    date: date.toISOString(),
    uri: uri,
    verb: verb,
    runid: runId,
    testname: testName,

  };

  return data;
}

/**
 * Write date to Azure Table using the rest APIs.
 * @param {*} data 
 * @param {string} storageAccountName 
 * @param {string} accessKey 
 * @param {string} tableName 
 * @param {date} date 
 * @returns 
 */
function writeDataToAzureTable(data, storageAccountName, accessKey, tableName, date) {
  // Parameter Validation
  if (!data || data === null) {
    throw "data parameter is required";
  }
  
  if (!storageAccountName || storageAccountName === "" || storageAccountName === null) {
    throw "storageAccountName parameter is required";
  }

  if (!accessKey || accessKey === "" || accessKey === null) {
    throw "accessKey parameter is required";
  }

  if (!tableName || tableName === "" || tableName === null) {
    throw "tableName parameter is required";
  }

  if (!date || date === null)
  {
    date = new Date();  
  }

  console.log(`Logging Result to Azure`)
  console.log(JSON.stringify(data));
        
  const url = `https://${storageAccountName}.table.core.windows.net/${tableName}`;
  const headers = generateAzureTablesHeader(storageAccountName, accessKey, tableName, date)
  const res = http.post(url, JSON.stringify(data), { headers });
  
  // Check the response status
  if (res.status < 200 || res.status > 299) {
    console.error(`Azure Table request failed with status ${res.status}.\nRequest Body: ${res.body}`);
  }

  return res;
}

// Exports
exports.writeDataToAzureTable = writeDataToAzureTable;
exports.generateXMDeploymentDateRecord = generateXMDeploymentDateRecord;
exports.azureTableSummary = azureTableSummary;
exports.generateEndpointMetric = generateEndpointMetric;