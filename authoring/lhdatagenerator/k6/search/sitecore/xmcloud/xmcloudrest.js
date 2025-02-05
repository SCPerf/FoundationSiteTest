/**
 * © 2021 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 * General Workflow: https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3626205267/XM+Cloud+-+Deploying+from+Automation+Tools
 */

// #region Modules
import http from 'k6/http'
import exec from 'k6/execution';
import { globalSettings } from '../common/globalSettings.js';
import { GetConfig } from "../common/globalSettings.js";
import { Debug } from '../sitecore.js';
import * as settings from '../common/globalSettings.js';
import encoding from 'k6/encoding';
import { generateEndpointMetric, writeDataToAzureTable } from '../common/azuretableutilities.js'

// #endregion

// Load Files Required For Upload
// const sourceFile = open(GetConfig(__ENV.XMCLOUD_TEST_SOURCE_PATH, globalSettings.XMCLOUD_TEST_SOURCE_PATH, ""), 'b');

export var azureTableSetting = {};
export var dataExtensions = {};

// #region Common
/**
 * Get XMCloud Authentication (Bearer) Token. see https://stylelabs.atlassian.net/wiki/spaces/ONES/pages/3491692689/How+to+Onboard+Your+Application+to+Identity+System#URLs-of-the-OAuth-Authorization-Server
 * @param {string} authServer    The authetication server url. see https://stylelabs.atlassian.net/wiki/spaces/ONES/pages/3491692689/How+to+Onboard+Your+Application+to+Identity+System#URLs-of-the-OAuth-Authorization-Server
 * @param {string} clientid      The client Id. (Values are part of Organization Provisioning)
 * @param {string} clientsecret  The client secret. (Values are part of Organization Provisioning)
 * @param {string} audience      The audience. see https://stylelabs.atlassian.net/wiki/spaces/ONES/pages/3501457418/API+Inventory#Audiences.6
 * @param {string} grant_type    Specifies the type of the authorization flow that will be used. see https://oauth.net/2/grant-types/
 * @returns 
 */
export function GetToken(authServer, clientid, clientsecret, audience, grant_type="client_credentials")
{
    if (authServer == null ||
        authServer == undefined ||
        authServer.length == 0) {
        throw 'authServer must be defined.'
    }

    if (clientid == null ||
        clientid == undefined ||
        clientid.length == 0) {
        throw 'clientid must be defined.'
    }

    if (clientsecret == null ||
        clientsecret == undefined ||
        clientsecret.length == 0) {
        throw 'clientsecret is a required parameter.'
    }

    if (audience == null ||
        audience == undefined ||
        audience.length == 0) {
        throw 'audience is a required parameter.'
    }

    if (grant_type == null ||
        grant_type == undefined ||
        grant_type.length == 0) {
        throw 'grant_type is a required parameter.'
    }

    let url = authServer
    let params = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    let data = {
        client_id: clientid,
        client_secret: clientsecret,
        audience: audience,
        grant_type: grant_type
    }

    // Debug(`(${exec.vu.idInTest}) Auth0 Url: ${url}`)
    // Debug(`(${exec.vu.idInTest}) Post Parameters: ${JSON.stringify(data)}`)

    let response = http.post(url, data, params);

    // Debug(`(${exec.vu.idInTest}) Get Token Response: ${JSON.stringify(response.body)}`)
    
    if (response.status != 200)
    {
        throw "Token was not obtained."
    }

    let responseObj = JSON.parse(response.body)
    let scopes = responseObj.scope.split(" ");

    Debug(`Current Token Scopes:`)
    for (let i = 0; i < scopes.length; i++)
    {
        Debug(`Scope: ${scopes[i]}`)
    }

    return responseObj.access_token
}

/**
 * Generates the configuration required to communicate with XMCloud APIs.
 * @returns XMLCloudConfiguration Object.
 */
export function GenerateXMCloudConfiguration() {
    var clientInfo = {
        host: GetConfig(__ENV.XMCLOUDREST_HOST, globalSettings.xmcloudrest_host, ""),
        authServer: GetConfig(__ENV.XMCLOUDREST_AUTH_SERVER, globalSettings.xmcloudrest_auth_server, ""),
        clientid: GetConfig(__ENV.XMCLOUDREST_CLIENT_ID, globalSettings.xmcloudrest_client_id, ""),
        clientsecret: GetConfig(__ENV.XMCLOUDREST_CLIENT_SECRET, globalSettings.xmcloudrest_client_secret, ""),
        audience: GetConfig(__ENV.XMCLOUDREST_AUDIENCE, globalSettings.xmcloudrest_audience, ""),
        grant_type: GetConfig(__ENV.XMCLOUDREST_GRANT_TYPE, globalSettings.xmcloudrest_grant_type, ""),
    }

    // Validate the clientInfo class
    if (clientInfo.host == null ||
        clientInfo.host == undefined ||
        clientInfo.host.length == 0) {
        throw 'xmcloudrest_host must be defined in the settings file or environment variable.'
    }

    if (clientInfo.authServer == null ||
        clientInfo.authServer == undefined ||
        clientInfo.authServer.length == 0) {
        throw 'xmcloudrest_authServer must be defined in the settings file or environment variable.'
    }

    if (clientInfo.clientid == null ||
        clientInfo.clientid == undefined ||
        clientInfo.clientid.length == 0) {
        throw 'xmcloudrest_clientid must be defined in the settings file or environment variable.'
    }

    if (clientInfo.clientsecret == null ||
        clientInfo.clientsecret == undefined ||
        clientInfo.clientsecret.length == 0) {
        throw 'xmcloudrest_clientsecret must be defined in the settings file or environment variable.'
    }

    if (clientInfo.audience == null ||
        clientInfo.audience == undefined ||
        clientInfo.audience.length == 0) {
        throw 'xmcloudrest_audience must be defined in the settings file or environment variable.'
    }

    if (clientInfo.grant_type == null ||
        clientInfo.grant_type == undefined ||
        clientInfo.grant_type.length == 0) {
        throw 'xmcloudrest_grant_type must be defined in the settings file or environment variable.'
    }

    return clientInfo;
}

export function GenerateXMCloudConfigurationOrgs(randomOrg) {
    var clientInfo = {
        host: randomOrg.xmcloudrest_host,
        authServer: randomOrg.xmcloudrest_auth_server,
        clientid: randomOrg.xmcloudrest_client_id,
        clientsecret: randomOrg.xmcloudrest_client_secret,
        audience: randomOrg.xmcloudrest_audience,
        grant_type: randomOrg.xmcloudrest_grant_type,
    }

    // Validate the clientInfo class
    if (clientInfo.host == null ||
        clientInfo.host == undefined ||
        clientInfo.host.length == 0) {
        throw 'xmcloudrest_host must be defined in the settings file or environment variable.'
    }

    if (clientInfo.authServer == null ||
        clientInfo.authServer == undefined ||
        clientInfo.authServer.length == 0) {
        throw 'xmcloudrest_authServer must be defined in the settings file or environment variable.'
    }

    if (clientInfo.clientid == null ||
        clientInfo.clientid == undefined ||
        clientInfo.clientid.length == 0) {
        throw 'xmcloudrest_clientid must be defined in the settings file or environment variable.'
    }

    if (clientInfo.clientsecret == null ||
        clientInfo.clientsecret == undefined ||
        clientInfo.clientsecret.length == 0) {
        throw 'xmcloudrest_clientsecret must be defined in the settings file or environment variable.'
    }

    if (clientInfo.audience == null ||
        clientInfo.audience == undefined ||
        clientInfo.audience.length == 0) {
        throw 'xmcloudrest_audience must be defined in the settings file or environment variable.'
    }

    if (clientInfo.grant_type == null ||
        clientInfo.grant_type == undefined ||
        clientInfo.grant_type.length == 0) {
        throw 'xmcloudrest_grant_type must be defined in the settings file or environment variable.'
    }

    return clientInfo;
}

/**
 * Generates run information for using XM Cloud Rest API.
 * @returns Run Information.
 */
export function GetRunInformation()
{
    var clientInfo = GenerateXMCloudConfiguration();
    var token = GetToken(clientInfo.authServer, clientInfo.clientid, clientInfo.clientsecret, clientInfo.audience, clientInfo.grant_type);
    var host = clientInfo.host

    var runInfo = {
        host: host,
        authToken: token
    }

    return runInfo;
}

/**
 * 
 * @param {*} token 
 * @returns 
 */
export function GenerateBearerHeader(token, contentType="application/json") {
    if (token == null ||
        token == undefined ||
        token.length == 0) {
        throw 'token must be defined.'
    }

    let params = {
        headers: {
            "Content-Type": contentType,
            Authorization: "Bearer " + token
        }
}

    return params
}
// #endregion

// #region Organizations

// #endregion

// #region Projects
/**
 * List projects --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Project---List
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Project List --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Response-Object.2
 */
export function GetProjects(host, authToken) {
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    let url = `https://${host}/api/projects/v1`
    LogUsage("/api/projects/v1", "GET");
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response;
}

/**
 * Get a specific project --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Project---Get
 * @param {string} projectId The project id of the project to return.
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Project information. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Response-Object.3
 */
export function GetProject(projectId, host, authToken) {
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (projectId == null ||
        projectId == undefined ||
        projectId.length == 0) {
        throw 'projectId must be defined.'
    }

    let url = `https://${host}/api/projects/v1/${projectId}`
    LogUsage("/api/projects/v1/{projectId}", "GET");
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response;
}

/**
 * Create a project. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Project---Create
 * @param {string} projectName Name of the project to create.
 * @param {string} region The region to create the project.
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Project Information. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Response-Object
 */
export function CreateProject(projectName, region="weu", host, authToken) {
    if (projectName == null ||
        projectName == undefined ||
        projectName.length == 0) {
        throw 'projectName must be defined.'
    }

    if (region == null ||
        region == undefined ||
        region.length == 0) {
        throw 'region must be defined.'
    }

    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    let post = {
        "name": projectName
    }

    let url = `https://${host}/api/projects/v1`
    LogUsage("/api/projects/v1", "POST");
    let response = http.post(url, JSON.stringify(post), GenerateBearerHeader(authToken))


    return response
}

/**
 * Delete a project. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Project---Delete
 * @param {string} projectId The project id of the project to return.
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Operation Status. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Response-Status-Code.3
 */
export function DeleteProject(projectId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (projectId == null ||
        projectId == undefined ||
        projectId.length == 0) {
        throw 'projectId must be defined.'
    }

    let current = new Date()
    current.setHours(current.getHours() - 12)
    
    let url = `https://${host}/api/projects/v1/${projectId}`
    LogUsage("/api/projects/v1/{projectId}", "DELETE");
    let response = http.del(url, "", GenerateBearerHeader(authToken))
    return response;
}
// #endregion

// #region Environment
/**
 * Create Environment --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#Project---Environment---Create
 * @param {string} environmentName Environment Name
 * @param {string} projectId Project Id
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Environment Information. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470262336/XM+Cloud+Deploy+API+-+Projects#202-Response
 */
export function CreateEnvironment(environmentName, projectId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (environmentName == null ||
        environmentName == undefined ||
        environmentName.length == 0) {
        throw 'environmentName must be defined.'
    }

    if (projectId == null ||
        projectId == undefined ||
        projectId.length == 0) {
        throw 'projectId must be defined.'
    }

    let post = {
        "name": environmentName
    }

    let url = `https://${host}/api/projects/v1/${projectId}/environments`
    LogUsage("/api/projects/v1/{projectId}/environments", "POST");
    let response = http.post(url, JSON.stringify(post), GenerateBearerHeader(authToken))
    return response
}

/**
 * Get a list of environments.
 * @param {string} projectId Project Id
 * @param {string} host      The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns List of environments.
 */
export function GetEnvironments(projectId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (projectId == null ||
        projectId == undefined ||
        projectId.length == 0) {
        throw 'projectId must be defined.'
    }

    let url = `https://${host}/api/projects/v1/${projectId}/environments`
    LogUsage("/api/projects/v1/{projectId}/environments", "GET");
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response;
}

/**
 * Get Environment Information. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Environments---Get
 * @param {*} environmentId EnvironmentId that identifies which environment to remove.
 * @param {*} host The API Host url.
 * @param {*} authToken Bearer authentication token.
 * @returns Environment Information. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Response-Status-Codes.3
 */
export function GetEnvironment(environmentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (environmentId == null ||
        environmentId == undefined ||
        environmentId.length == 0) {
        throw 'environmentId must be defined.'
    }

    let url = `https://${host}/api/environments/v1/${environmentId}`
    LogUsage("/api/environments/v1/{environmentId}", "GET");
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response;
}

/**
 * Explicitly removes an environment. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Environments---Delete-Explicit
 * @param {string} environmentId EnvironmentId that identifies which environment to remove.
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Operation status. (202, 404, or 409) --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Response-Status-Codes.2
 */
export function DeleteExplicit(environmentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (environmentId == null ||
        environmentId == undefined ||
        environmentId.length == 0) {
        throw 'environmentId must be defined.'
    }

    // let current = new Date()
    // current.setHours(current.getHours() - 12)
    
    let url = `https://${host}/api/environments/v1/${environmentId}/explicit?deleteAt=2009-06-15T13:45:30`
    let response = http.del(url, "", GenerateBearerHeader(authToken))
    return response;
}

/**
 * Delete Environment. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Environments---Delete
 * @param {string} environmentId EnvironmentId that identifies which environment to remove.
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Operation status. (202, 404, or 409) --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Response-Status-Codes.1
 */
export function Delete(environmentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (environmentId == null ||
        environmentId == undefined ||
        environmentId.length == 0) {
        throw 'environmentId must be defined.'
    }

    // let current = new Date()
    // current.setHours(current.getHours() - 12)
    
    let url = `https://${host}/api/environments/v1/${environmentId}`
    let response = http.del(url, "", GenerateBearerHeader(authToken))
    return response;
}
// #endregion

// #region Deployments
/**
 * Create a deployment. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Environment---Deployments---Create
 * @param {string} environmentId Environment Id.
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Deployment Information. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#202-Response
 */
export function CreateDeployment(environmentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (environmentId == null ||
        environmentId == undefined ||
        environmentId.length == 0) {
        throw 'environmentId must be defined.'
    }

    let url = `https://${host}/api/environments/v1/${environmentId}/deployments`
    let response = http.post(url, "{}", GenerateBearerHeader(authToken))
    return response
}

/**
 * Starts deployment. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470360649/XM+Cloud+Deploy+API+-+Deployments#Deployments---Deploy
 * @param {string} deploymentId Deployment Id
 * @param {string} host The API Host url.
 * @param {*} authToken Bearer authentication token.
 * @returns 200 OK, 404 Not Found, 409 Conflict. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470360649/XM+Cloud+Deploy+API+-+Deployments#Response-Status-Code.6
 */
export function DeployDeployment(deploymentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (deploymentId == null ||
        deploymentId == undefined ||
        deploymentId.length == 0) {
        throw 'deploymentId must be defined.'
    }

    let url = `https://${host}/api/deployments/v1/${deploymentId}/deploy`
    LogUsage("/api/deployments/v1/{deploymentId}/deploy", "POST");
    let response = http.post(url, "", GenerateBearerHeader(authToken))
    return response
}

/**
 * Cancel deployment. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470360649/XM+Cloud+Deploy+API+-+Deployments#Deployments---Cancel
 * @param {string} deploymentId Deployment Id
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns 200 OK, 404 Not Found. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470360649/XM+Cloud+Deploy+API+-+Deployments#Response-Status-Code.8
 */
export function CancelDeployment(deploymentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (deploymentId == null ||
        deploymentId == undefined ||
        deploymentId.length == 0) {
        throw 'deploymentId must be defined.'
    }

    let url = `https://${host}/api/deployments/v1/${deploymentId}/cancel`
    LogUsage("/api/deployments/v1/{deploymentId}/cancel", "POST");
    let response = http.post(url, "", GenerateBearerHeader(authToken))
    return response
}

/**
 * Get Deployment List. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Environment---Deployments---List
 * @param {string} environmentId Environment Id
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns List of Deployments. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3469738090/XM+Cloud+Deploy+API+-+Environments#Response-Object.2
 */
export function GetDeployments(environmentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (environmentId == null ||
        environmentId == undefined ||
        environmentId.length == 0) {
        throw 'environmentId must be defined.'
    }

    let url = `https://${host}/api/environments/v1/${environmentId}/deployments`
    LogUsage("/api/environments/v1/{environmentId}/deployments", "GET");
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response;
}

/**
 * Get Deployment Information. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470360649/XM+Cloud+Deploy+API+-+Deployments#Deployments---Get
 * @param {string} deploymentId Deployment Id
 * @param {string} host The API Host url.
 * @param {string} authToken Bearer authentication token.
 * @returns Deployment Information. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470360649/XM+Cloud+Deploy+API+-+Deployments#Response-Object
 */
export function GetDeployment(deploymentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (deploymentId == null ||
        deploymentId == undefined ||
        deploymentId.length == 0) {
        throw 'deploymentId must be defined.'
    }

    let url = `https://${host}/api/deployments/v1/${deploymentId}`
    LogUsage("/api/deployments/v1/{deploymentId}", "GET");
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response;
}

/**
 * Push source file to a deployment. --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470360649/XM+Cloud+Deploy+API+-+Deployments#Deployments---Source
 * @param {*} deploymentId Deployment Id
 * @param {*} host The API Host url.
 * @param {*} authToken Bearer authentication token.
 * @returns 202, 490 --> https://stylelabs.atlassian.net/wiki/spaces/MAP/pages/3470360649/XM+Cloud+Deploy+API+-+Deployments
 */
export function SourceDeployment(deploymentId, host, authToken)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (deploymentId == null ||
        deploymentId == undefined ||
        deploymentId.length == 0) {
        throw 'deploymentId must be defined.'
    }

    //const file = http.file(binFile, 'artifact.zip');
    let url = `https://${host}/api/deployments/v1/${deploymentId}/source`
    LogUsage("/api/deployments/v1/{deploymentId}/source", "POST");
    // let response = http.post(url, sourceFile , GenerateBearerHeader(authToken, "application/octet-stream"))
    return response;
}

/**
 * 
 * @param {*} deploymentId Deployment Id
 * @param {*} host The API Host url.
 * @param {*} authToken Bearer authentication token.
 * @param {*} repositoryPath The respository ACR path
 * @param {*} tag The image tag.
 * @returns 
 */
export function SpecifyImageDeployment(deploymentId, host, authToken, repositoryPath, tag)
{
    if (host == null ||
        host == undefined ||
        host.length == 0) {
        throw 'host must be defined.'
    }

    if (authToken == null ||
        authToken == undefined ||
        authToken.length == 0) {
        throw 'authToken must be defined.'
    }

    if (deploymentId == null ||
        deploymentId == undefined ||
        deploymentId.length == 0) {
        throw 'deploymentId must be defined.'
    }

    // Create the post body
    let post = {
        "repositoryPath": repositoryPath,
        "tag": tag,
        "sitecoreMajorVersion": 0
    }

    let url = `https://${host}/api/deployments/v1/${deploymentId}/image`
    LogUsage("/api/deployments/v1/{deploymentId}/image", "POST");
    let response = http.post(url, JSON.stringify(post) , GenerateBearerHeader(authToken))
    return response;
}

export function AddAnnotation(msg, tags = []) {
    Debug("AddAnnotation");
    // send custom payload/post data
    const payload = JSON.stringify({
        dashboardId: parseInt(settings.AnnotateDashboard()),
        panelId: parseInt(settings.AnnotatePanel()),
        tags: tags,
        text: msg
    });

    Debug("Payload: " + payload);
    var creds = settings.AnnotateUser() + ":" + settings.AnnotatePwd();
    Debug(creds);

    // encrypt your credentials in base64 format
    const encodedCredentials = encoding.b64encode(creds);

    Debug(`Url: ${settings.AnnotateUrl()}`);
    // send post request with custom header and payload
    var response = http.post(`${settings.AnnotateUrl()}/api/annotations`, payload, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${encodedCredentials}`,
        },
    });

    Debug("Response: " + JSON.stringify(response.json()));
}

export function AddRangeAnnotation(start, end, msg, tags = []) {
    Debug("AddAnnotation");
    // send custom payload/post data
    const payload = JSON.stringify({
        time: start,
        timeEnd: end,
        dashboardId: parseInt(settings.AnnotateDashboard()),
        panelId: parseInt(settings.AnnotatePanel()),
        tags: tags,
        text: msg
    });

    Debug("Payload: " + payload);
    var creds = settings.AnnotateUser() + ":" + settings.AnnotatePwd();
    Debug(creds);

    // encrypt your credentials in base64 format
    const encodedCredentials = encoding.b64encode(creds);

    Debug(`Url: ${settings.AnnotateUrl()}`);
    // send post request with custom header and payload
    var response = http.post(`${settings.AnnotateUrl()}/api/annotations`, payload, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${encodedCredentials}`,
        },
    });

    Debug("Response: " + JSON.stringify(response.json()));
}

export function LogStateData(stage, region, prefix, user, value, timestamp) {

    const timestampPaddedLength = 19;
    var timestampPadded = timestamp.toString().padEnd(timestampPaddedLength, 0);

    var body = `deploy_stage,sort=${user}_${stage},stage=${stage},region=${region},prefix=${prefix},user=${user} value="${value}" ${timestampPadded}`;
    Debug(`Body=${body}`);

    var response = http.post(`${settings.StateDataUrl()}/write?db=${settings.StateDataDb()}`, body, {
        headers: {
            'Accept': '*/*',
        },
    });

    Debug("Status - LogStateData: " + response.status);

}

export function LogDurationData(stage, region, prefix, user, value, timestamp) {

    const timestampPaddedLength = 19;
    var timestampPadded = timestamp.toString().padEnd(timestampPaddedLength, 0);

    var body = `deploy_duration,sort=${user}_${stage},stage=${stage},region=${region},prefix=${prefix},user=${user} value="${value}" ${timestampPadded}`;
    Debug(`Body=${body}`);

    var response = http.post(`${settings.StateDataUrl()}/write?db=${settings.StateDataDb()}`, body, {
        headers: {
            'Accept': '*/*',
        },
    });

    Debug("Status - LogDurationData: " + response.status);

}
// #endregion

function LogUsage(uri, verb) {
    var enableAzureTables = true;
    var runId = settings.GetEnvironmentConfig("runid");
    const accountSettings = {};
    accountSettings.StorageAccountName = settings.GetEnvironmentConfig("storageaccountname");
    accountSettings.AccessKey = settings.GetEnvironmentConfig("accesskey");
    accountSettings.TableName = settings.GetEnvironmentConfig("tablename");
    
    if (!accountSettings.StorageAccountName || accountSettings.StorageAccountName === "" || accountSettings.StorageAccountName === null) {
        enableAzureTables = false;
    }

    if (!accountSettings.AccessKey || accountSettings.AccessKey === "" || accountSettings.AccessKey === null) {
        enableAzureTables = false;
    }

    if (!accountSettings.TableName || accountSettings.TableName === "" || accountSettings.TableName === null) {
        enableAzureTables = false;
    }

    if (runId) {
        if (enableAzureTables) {
            const data = generateEndpointMetric(uri, verb, runId, "XMCloud Benchmark")
            writeDataToAzureTable(data, accountSettings.StorageAccountName, accountSettings.AccessKey, accountSettings.TableName)
        }
    }
}
