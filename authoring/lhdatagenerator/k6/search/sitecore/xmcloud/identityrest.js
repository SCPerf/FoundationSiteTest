// #region Modules
import http from 'k6/http'
import { globalSettings } from '../common/globalSettings.js';
import { GetConfig } from "../common/globalSettings.js";
import { GetToken, GenerateBearerHeader } from "./xmcloudrest.js"
// #endregion

// #region Common

/**
 * Generates the configuration required to communicate with XMCloud APIs.
 * @returns XMLCloudConfiguration Object.
 */
export function GenerateIdentifyConfiguration() {
    var clientInfo = {
        host: GetConfig(__ENV.IDENTITY_HOST, globalSettings.identity_host, ""),
        authServer: GetConfig(__ENV.IDENTITY_AUTH_SERVER, globalSettings.identity_auth_server, ""),
        clientid: GetConfig(__ENV.IDENTITY_CLIENT_ID, globalSettings.identity_client_id, ""),
        clientsecret: GetConfig(__ENV.IDENTITY_CLIENT_SECRET, globalSettings.identity_client_secret, ""),
        audience: GetConfig(__ENV.IDENTITY_AUDIENCE, globalSettings.identity_audience, ""),
        grant_type: GetConfig(__ENV.IDENTITY_GRANT_TYPE, globalSettings.identity_grant_type, ""),
    }

    console.log(JSON.stringify(clientInfo))

    // Validate the clientInfo class
    if (clientInfo.host == null ||
        clientInfo.host == undefined ||
        clientInfo.host.length == 0) {
        throw 'identity_host must be defined in the settings file or environment variable.'
    }

    if (clientInfo.authServer == null ||
        clientInfo.authServer == undefined ||
        clientInfo.authServer.length == 0) {
        throw 'identity_authServer must be defined in the settings file or environment variable.'
    }

    if (clientInfo.clientid == null ||
        clientInfo.clientid == undefined ||
        clientInfo.clientid.length == 0) {
        throw 'identity_clientid must be defined in the settings file or environment variable.'
    }

    if (clientInfo.clientsecret == null ||
        clientInfo.clientsecret == undefined ||
        clientInfo.clientsecret.length == 0) {
        throw 'identity_clientsecret must be defined in the settings file or environment variable.'
    }

    if (clientInfo.audience == null ||
        clientInfo.audience == undefined ||
        clientInfo.audience.length == 0) {
        throw 'identity_audience must be defined in the settings file or environment variable.'
    }

    if (clientInfo.grant_type == null ||
        clientInfo.grant_type == undefined ||
        clientInfo.grant_type.length == 0) {
        throw 'identity_grant_type must be defined in the settings file or environment variable.'
    }

    return clientInfo;
}

/**
 * Generates run information for using XM Cloud Rest API.
 * @returns Identity Run Information.
 */
export function GetIdentityRunInformation()
{
    var clientInfo = GenerateIdentifyConfiguration();
    var token = GetToken(clientInfo.authServer, clientInfo.clientid, clientInfo.clientsecret, clientInfo.audience, clientInfo.grant_type);
    var host = clientInfo.host

    var runInfo = {
        host: host,
        authToken: token
    }

    return runInfo;
}

// #endregion

// #region Users

export function CreateOrganizationUser(email, password, host, authToken, emailVerified = true)
{
    if (email == null ||
        email == undefined ||
        email.length == 0) {
        throw 'email must be defined.'
    }

    if (password == null ||
        password == undefined ||
        password.length == 0) {
        throw 'password must be defined.'
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

    if (emailVerified == undefined) {
        throw 'emailVerified must be defined.'
    }

    let post = {
        "email": email,
        "password": password,
        "emailVerified": emailVerified
    }

    let url = `https://${host}/api/identity/admin/v1/users`
    let response = http.post(url, JSON.stringify(post), GenerateBearerHeader(authToken))
    return response
}

// #endregion

// #region Organizations

export function GetOrganization(organizationId, host, authToken)
{
    if (organizationId == null ||
        organizationId == undefined ||
        organizationId.length == 0) {
        throw 'organizationId must be defined.'
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

    let url = `https://${host}/api/identity/admin/v1/organizations/${organizationId}`
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response
}

export function GetOrganizationsOffset(host, authToken, pageNumber=1, pageSize=50)
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

    if (pageNumber == undefined) {
        throw 'pageNumber must be defined.'
    }

    if (pageSize == undefined) {
        throw 'pageSize must be defined.'
    }

    let url = `https://${host}/api/identity/admin/v1/organizations?pageNumber=${pageNumber}&pagesize=${pageSize}`
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response
}

export function GetOrganizationsCheckpoint (host, authToken, from="", take=50)
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

    if (from == undefined) {
        throw 'from must be defined.'
    }

    if (take == undefined) {
        throw 'take must be defined.'
    }

    let url = `https://${host}/api/identity/admin/v1/organizations?from=${from}&pagesize=${pageSize}`
    if (from.length == 0)
    {
        url = `https://${host}/api/identity/admin/v1/organizations?pagesize=${pageSize}`
    }
    
    let response = http.get(url, GenerateBearerHeader(authToken))
    return response
}

export function CreateOrganization(name, displayName, email, host, authToken, accountId = "DemoAccountId", defaultDeploymentRegion = "West Europe", phoneNumber = "+123456789", defaultLanguage="en-US", emailVerified = true)
{
    if (name == null ||
        name == undefined ||
        name.length == 0) {
        throw 'name must be defined.'
    }

    if (displayName == null ||
        displayName == undefined ||
        displayName.length == 0) {
        throw 'displayName must be defined.'
    }

    if (accountId == null ||
        accountId == undefined ||
        accountId.length == 0) {
        throw 'accountId must be defined.'
    }

    if (email == null ||
        email == undefined ||
        email.length == 0) {
        throw 'email must be defined.'
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

    if (defaultDeploymentRegion == null ||
        defaultDeploymentRegion == undefined ||
        defaultDeploymentRegion.length == 0) {
        throw 'defaultDeploymentRegion must be defined.'
    }

    if (phoneNumber == null ||
        phoneNumber == undefined ||
        phoneNumber.length == 0) {
        throw 'phoneNumber must be defined.'
    }

    if (defaultLanguage == null ||
        defaultLanguage == undefined ||
        defaultLanguage.length == 0) {
        throw 'defaultLanguage must be defined.'
    }

    if (emailVerified == undefined) {
        throw 'emailVerified must be defined.'
    }

    let post = {
        "displayName": displayName,
        "createdBy": email,
        "defaultDeploymentRegion": defaultDeploymentRegion,
        "phoneNumber": phoneNumber,
        "defaultLanguage": defaultLanguage,
        "name": name,
        "accountId": accountId
    }

    let url = `https://${host}/api/identity/admin/v1/organizations`
    let response = http.post(url, JSON.stringify(post), GenerateBearerHeader(authToken))
    return response
}

// #endregion