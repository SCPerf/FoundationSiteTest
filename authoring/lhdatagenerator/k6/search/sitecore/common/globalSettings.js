/**
 * © 2020 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */
import exec from "k6/execution";

const data = GetSettings();
export var globalSettings = data;

function GetSettings()
{
    var file = LoadSettingFile("../../settings.dev.json");
    if (file != undefined)
    {
        file.settingsFile = "settings.dev.json"
        return file;
    }

    for (let index = 1; index < 10; index++) {
        file = LoadSettingFile("../../settings.dev" + index + ".json");
        if (file != undefined)
        {
            file.settingsFile = "settings.dev" + index + ".json";
            return file;
        }
    }
    
    file = JSON.parse(open("../../settings.json"));
    file.settingsFile = "settings.json";
    return file;
}

function LoadSettingFile(filename)
{
    try
    {
        return JSON.parse(open(filename));
    }
    catch (ex)
    {
        return undefined;
    }
}

export function SettingsFile()
{
    return globalSettings.settingsFile;
}

export function Site() {
    const offset = (exec.vu.idInInstance % sites.length);
    return sites[offset].host;
}

/**
 * Gets the root configuration from Environment and/or configuration
 */
export function RootUrl() {
    const offset = (exec.vu.idInInstance % sites.length);
    const hostName = sites[offset].host;
    var defaultProtocol = GetConfig(__ENV.DEFAULTPROTOCOL, globalSettings.defaultProtocol, "http://");
    // var hostName = GetConfig(__ENV.HOSTNAME, globalSettings.hostName, "localhost");
    return defaultProtocol + hostName;
}

/**
 * Gets the root for the id server.
 * @returns root of the id server.
 */
export function idRootUrl() {
    var defaultProtocol = GetConfig(__ENV.DEFAULTPROTOCOL, globalSettings.defaultProtocol, "http://");
    var hostName = GetConfig(__ENV.IDHOSTNAME, globalSettings.idHostName, "xp1id.sitecore.local.com");
    return defaultProtocol + hostName;
}

/**
 * Gets if analytics is enabled from environment or configuration
 */
export function AnalyticsEnabled() {
    var analyticsEnabled = GetConfig(__ENV.ANALYTICSENABELD, globalSettings.analytics , false);
    return analyticsEnabled;
}

/**
 * Gets if IP spoofing for xConnect is not allowed
 */
export function AnalyticsIpSpoofEnabled() {
    var AnalyticsIpSpoofEnabled = GetConfig(__ENV.ANALYTICSIPSPOOF, globalSettings.analyticsIpSpoof , false);
    return AnalyticsIpSpoofEnabled;
}

/**
 * Get encoding setting demo Environment or contiguration.
 */
export function GlobalEncoding() {
    var encoding = GetConfig(__ENV.ENCODING, globalSettings.encoding , "");
    return encoding;
}

/**
 * Get the default thinktime
 * @returns the default thinktime
 */
export function DefaultThinktime() {
    var thinktime = GetConfig(__ENV.THINKTIME, globalSettings.thinkTime , 1);
    return thinktime;
}

export function StorageAccount() {
    var value = GetConfig(__ENV.storageaccount, globalSettings.StorageAccount, "");
    return value;
}

export function StorageKey() {
    var value = GetConfig(__ENV.storagekey, globalSettings.StorageKey, "");
    return value;
}

export function RebuildTableName() {
    var value = GetConfig(__ENV.rebuildtablename, globalSettings.RebuildTableName, "");
    return value;
}

export function QueryTableName() {
    var value = GetConfig(__ENV.querytablename, globalSettings.QueryTableName, "");
    return value;
}

export function SearchStaxTableName() {
    var value = GetConfig(__ENV.searchstaxtablename, globalSettings.SearchStaxTableName, "");
    return value;
}

/**
 * Gets a cli setting from the __ENV object.
 * @param {string} settingName Setting name
 * @param {any} defaultValue Default Value to set
 * @returns Setting Value
 */
export function GetTextCliSetting(settingName, defaultValue="")
{
    if (__ENV[settingName]) {
        return String(__ENV[settingName]);
    } else {
        return String(defaultValue);
    }
}

/**
 * Get a number parameter set from the client.
 * @param {string} settingName Setting name passed in vial the client.
 * @param {bool} defaultValue Default value.
 * @returns Setting value.
 */
export function GetNumberCliSetting(settingName, defaultValue)
{
    if (__ENV[settingName]) {
        return Number(__ENV[settingName]);
    } else {
        return Number(defaultValue);
    }
}

/**
 * Get a boolean parameter set from the client.
 * @param {string} settingName Setting name passed in vial the client.
 * @param {bool} defaultValue Default value.
 * @returns Setting value.
 */
export function GetBoolCliSetting(settingName, defaultValue)
{
    if (__ENV[settingName]) {
        return JSON.parse(__ENV[settingName].toLowerCase())
    } else {
        return Boolean(defaultValue);
    }
}

/**
 * Get if the id server is used for login.
 */
export function UseIdLogin() {
    var useIdLogin = GetConfig(__ENV.USEIDLOGIN, globalSettings.useIdLogin , false);
    return useIdLogin;
}

export function DefaultAdminLoginUsername() {
    var defaultUsername = GetConfig(__ENV.DEFAULTADMINLOGINUSERNAME, globalSettings.DefaultAdminLoginUsername , "Admin");
    return defaultUsername;
}

export function DefaultAdminLoginPassword() {
    var defaultPassword = GetConfig(__ENV.DEFAULTADMINLOGINPASSWORD, globalSettings.DefaultAdminLoginPassword , "b");
    return defaultPassword;
}

export function DefaultAuthorLoginUsername() {
    var defaultUsername = GetConfig(__ENV.DEFAULTAUTHORLOGINUSERNAME, globalSettings.DefaultAuthorLoginUsername , "Author");
    return defaultUsername;
}

export function DefaultAuthorLoginPassword() {
    var defaultPassword = GetConfig(__ENV.DEFAULTAUTHORLOGINPASSWORD, globalSettings.DefaultAuthorLoginPassword , "b");
    return defaultPassword;
}

export function DefaultThinkTimeAfterAdd() {
    var defaultThinkTimeAfterAdd = GetConfig(__ENV.DEFAULTTHINKTIMEAFTERADD, globalSettings.ThinkTimeAfterAdd , 15);
    return defaultThinkTimeAfterAdd;
}

// export function ContentAuthors() {
//     var contentAuthors = GetConfig(__ENV.CONTENTAUTHORS, globalSettings.ContentAuthors , 50);
//     return contentAuthors;
// }

// export function BrowseUsers() {
//     var browseUsers = GetConfig(__ENV.BROWSEUSERS, globalSettings.BrowseUsers , 50);
//     return browseUsers;
// }

export function SharedDataHost() {
    var sharedDataHost = GetConfig(__ENV.SHAREDDATAHOST, globalSettings.sharedDataHost , "");
    return sharedDataHost;
}

export function SharedDataDefaultItemCount() {
  var sharedDataDefaultItemCount = GetConfig(
    __ENV.SHAREDDATADEFAULTITEMCOUNT,
    globalSettings.sharedDataDefaultItemCount,
    ""
  );
  return sharedDataDefaultItemCount;
}

// #region Test Parameters
export function TestVus() {
    return GetConfig(__ENV.XMCLOUD_TEST_VUS, globalSettings.XMCLOUD_TEST_VUS, "");
}

export function TestIterations() {
    return GetConfig(__ENV.XMCLOUD_TEST_ITERATIONS, globalSettings.XMCLOUD_TEST_ITERATIONS, "");
}

export function TestMaxDuration() {
    return GetConfig(__ENV.XMCLOUD_TEST_MAX_DURATION, globalSettings.XMCLOUD_TEST_MAX_DURATION, "");
}

export function TestGracefulStop() {
    return GetConfig(__ENV.XMCLOUD_TEST_GRACEFUL_STOP, globalSettings.XMCLOUD_TEST_GRACEFUL_STOP, "");
}

export function TestRegion() {
    return GetConfig(__ENV.XMCLOUD_TEST_REGION, globalSettings.XMCLOUD_TEST_REGION, "");
}

export function TestPrefix() {
    return GetConfig(__ENV.XMCLOUD_TEST_PREFIX, globalSettings.XMCLOUD_TEST_PREFIX, "");
}

export function TestOffset() {
    return GetConfig(__ENV.XMCLOUD_TEST_OFFSET, globalSettings.XMCLOUD_TEST_OFFSET, "");
}

export function TestSource() {
    return GetConfig(__ENV.XMCLOUD_TEST_SOURCE, globalSettings.XMCLOUD_TEST_SOURCE, "");
}

export function TestNumDeployments() {
    return GetConfig(__ENV.XMCLOUD_TEST_NUM_DEPLOYMENTS, globalSettings.XMCLOUD_TEST_NUM_DEPLOYMENTS, "");
}

export function TestCleanup() {
    return GetConfig(__ENV.XMCLOUD_TEST_CLEANUP, globalSettings.XMCLOUD_TEST_CLEANUP, "");
}

export function StatusSleep() {
    return GetConfig(__ENV.XMCLOUD_TEST_STATUS_SLEEP, globalSettings.XMCLOUD_TEST_STATUS_SLEEP, "");
}

export function DeploymentSleep() {
    return GetConfig(__ENV.XMCLOUD_TEST_DEPLOYMENT_SLEEP, globalSettings.XMCLOUD_TEST_DEPLOYMENT_SLEEP, "");
}

export function Annotate() {
    return GetConfig(__ENV.XMCLOUD_TEST_ANNOTATE, globalSettings.XMCLOUD_TEST_ANNOTATE, false);
}

export function AnnotateUser() {
    return GetConfig(__ENV.XMCLOUD_TEST_ANNOTATE_USER, globalSettings.XMCLOUD_TEST_ANNOTATE_USER, "");
}

export function AnnotatePwd() {
    return GetConfig(__ENV.XMCLOUD_TEST_ANNOTATE_PWD, globalSettings.XMCLOUD_TEST_ANNOTATE_PWD, "");
}

export function AnnotateUrl() {
    return GetConfig(__ENV.XMCLOUD_TEST_ANNOTATE_URL, globalSettings.XMCLOUD_TEST_ANNOTATE_URL, "");
}

export function AnnotateDashboard() {
    return GetConfig(__ENV.XMCLOUD_TEST_ANNOTATE_DASHBOARD, globalSettings.XMCLOUD_TEST_ANNOTATE_DASHBOARD, "");
}

export function AnnotatePanel() {
    return GetConfig(__ENV.XMCLOUD_TEST_ANNOTATE_PANEL, globalSettings.XMCLOUD_TEST_ANNOTATE_PANEL, "");
}

export function Org() {
    return GetConfig(__ENV.XMCLOUDREST_ID, globalSettings.XMCLOUDREST_ID, "");
}

export function StateDataUrl() {
    return GetConfig(__ENV.XMCLOUD_TEST_STATE_DATA_URL, globalSettings.XMCLOUD_TEST_STATE_DATA_URL, "");
}

export function StateDataDb() {
    return GetConfig(__ENV.XMCLOUD_TEST_STATE_DATA_DB, globalSettings.XMCLOUD_TEST_STATE_DATA_DB, "");
}
// #endregion Test Parameters

/**
 * Gets a config setting and resolve environment vs configuration
 * @param {*} environmentValue Environment value of the setting
 * @param {*} configValue Config value of the setting
 * @param {*} defaultValue Default value of a setting
 */
export function GetConfig(environmentValue, configValue, defaultValue) {
    var value = defaultValue;
    
    if (environmentValue === undefined) {
        if (configValue === undefined) {
            value = defaultValue;
        } else {
            value = configValue;
        }
    } else {
        value = environmentValue;
    }

    return value;
}

export function GetEnvironmentConfig(settingName, defaultValue="") {
    var value = defaultValue;
    
    if (__ENV[settingName]) {
        return String(__ENV[settingName]);
    } else {
        return String(defaultValue);
    }
}

export function PodeApiKey() {
  var podeApiKey = GetConfig(__ENV.PODEAPIKEY, globalSettings.podeApiKey, "");
  return podeApiKey;
}

export function DeploymentSleepInterval() {
  var deploymentSleepInterval = GetConfig(__ENV.DEPLOYMENTSLEEPINTERVAL, globalSettings.deploymentSleepInterval, 5000);
  return deploymentSleepInterval;
}

export function HostName() {
  var hostName = GetConfig(__ENV.HOSTNAME, globalSettings.hostName, "");
  return hostName;
}
