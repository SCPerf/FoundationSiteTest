/**
 * © 2020 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */
import { Trend } from "k6/metrics";
import { sleep } from 'k6';
import { globalSettings, AnalyticsEnabled, AnalyticsIpSpoofEnabled, GlobalEncoding, DefaultThinktime } from "./globalSettings.js"
import { uuidv4 } from "./utils.js";

var ThinkTimeTrend = new Trend('ThinktimeTrend', true);

/**
 * 
 * @description                 Applies think time --> thinkTime in settings.json.
 * @param {integer} seconds     Sets the thinktime in seconds.
 */
export function ApplyThinkTime(seconds) {
    if (seconds === undefined)
    {
        seconds = Math.floor(Math.random() * (DefaultThinktime() - 1) + 1);   
    }

    if (seconds < 0)
    {
        seconds = DefaultThinktime();
    }
    
    if (seconds > 0)
    {
        Debug("ThinkTime: " + seconds + "s");
        sleep(seconds);
    }

    return seconds;
}

/**
 * Applies a randomized thinktime
 * @description                 Applies a random think time.
 * @param {int} seconds         Number of seconds
 */
export function ApplyRandomizedThinkTime(seconds) {

    if (seconds === undefined)
    {
        seconds = DefaultThinktime();    
    }

    if (seconds < 0)
    {
        seconds = DefaultThinktime();
    }

    var environmentThinkTime = Number(__ENV.ThinkTime);
    var environmentThinkTimeVariance = Number(__ENV.ThinkTimeVariance);
    seconds = GetConfigNumberValue(environmentThinkTime, globalSettings.thinkTime, seconds)
    var variance = GetConfigNumberValue(environmentThinkTimeVariance, globalSettings.thinkTimeVariance, 0);
    var min = seconds - variance;
    var max = seconds + variance;
    if (min < 0)
    {
        min = 0
    }

    var thinkTime = Math.random() * (max - min) + min;
    Debug("Environment:ThinkTime: " + environmentThinkTime);
    Debug("Config:ThinkTime: " + seconds);
    Debug("Environment:ThinkTimeVariance: " + variance);
    Debug("Config:ThinkTimeVariance: " + variance);
    Debug("min: " + min);
    Debug("max: " + max);
    Debug("Generated ThinkTime: " + thinkTime + "s");
    
    if (thinkTime > 0)
    {
        ThinkTimeTrend.add(thinkTime)
        sleep(thinkTime);
    }

    return thinkTime;
}

/**
 * Outputs information when in debug mode
 * @param {*} event event to output
 */
export function Debug(event){
    var environmentDebug = __ENV.debug;
    var debug = false;
    if (environmentDebug === undefined)
    {
        if (globalSettings.debug === undefined) {
            debug = false;
        } else {
            debug = Boolean(globalSettings.debug);
        }
    } else {
        debug = Boolean(environmentDebug)
    }
    
    if (debug)
    {
        console.log(event);
    }
}

/**
 * Gets a setting that defines how many pages are part of a visit.
 */
export function PagesPerVisit(){
    var pagespervisitEnv = __ENV.pagespervisit;
    var pagespervisit = 5;
    if (pagespervisitEnv === undefined)
    {
        if (globalSettings.PagePerVisit === undefined) {
            pagespervisit = 5;
        } else {
            pagespervisit = Number(globalSettings.PagePerVisit);
        }
    } else {
        pagespervisit = Number(pagespervisitEnv)
    }

    return pagespervisit;
}

export function GetRunId() {
    if (__ENV["RunId"]) {
        return String(__ENV["RunId"]);
    }

    return String(uuidv4());
}

/**
 * Creatas a simple request param object,  Note CreateDefaultParams is the preferred call.
 * @param {*} reportname : report name to assign to the params
 * @param {*} timeout : Sets a custom timeout for the timeout setting.
 */
export function CreateParams(reportname, timeout) {
    var params = {};
    
    if (timeout == undefined)
    {
        params.timeout = globalSettings.globalTimeout;
    } else {
        params.timeout = timeout;
    }

    if (reportname != undefined)
    {
        params.tags = {}
        params.tags.ReportName = reportname;
    }

    return params;
}

/**
 * Creates or modified params object for k6 http requests
 * @param {*} params : Base parma object, when null a new parm object will be created
 * @param {*} reportname : name of report to tag
 * @param {*} timeout : http timeout
 */
export function CreateDefaultParams(params, reportname, timeout) {
    if (timeout == undefined) {
        timeout = globalSettings.globalTimeout;
    }

    // TODO: consider using JSON.parse(JSON.stringify(params)); to clone passed in params
    if (params == undefined) {
        params = {};
    }

    if (params.tags == undefined) {
        params.tags = {};
    }

    if (params.headers == undefined) {
        params.headers = {};
    }

    if (reportname !== undefined) {
        params.tags['ReportName'] = reportname;
    }

    if (AnalyticsEnabled()) {
        if (AnalyticsIpSpoofEnabled()) {
            var ipAddress = platform.GetRandomIpAddress();
            params.headers['X-Forwarded-For'] = ipAddress;
        }
    }
    
    params.headers['Accept-Encoding'] = GlobalEncoding();
    params.headers['user-agent'] = "K6 Loadtest";
    params['timeout'] = timeout

    return params;
}


/**
 * Default Status 200 HTTP Resquest Check
 * @param {*} pageName : unique name associated with the page being requested
 */
export function Response200Check(pageName = "request") {

    var name = pageName + " response was 200";
    var checks = {};
    checks[name] = (r) => r.status == 200;
    return checks;
}

/**
 * Status 201 HTTP Request Check
 * @param {string} pageName unique name associated with the page being requested
 * @returns 
 */
export function Response201Check(pageName = "request") {

    var name = pageName + " response was 201";
    var checks = {};
    checks[name] = (r) => r.status == 201;
    return checks;
}

export function Response202Check(pageName = "request") {

    var name = pageName + " response was 202";
    var checks = {};
    checks[name] = (r) => r.status == 202;
    return checks;
}

/**
 * @description                 Gets a value in order of precedence e.g. Environment, Config, Default
 * @param {*} environmentValue  Value defined from an environment variable
 * @param {*} configValue       Value defined in the config file
 * @param {*} defaultValue      Default Value.
 */
function GetConfigNumberValue(environmentValue, configValue, defaultValue) {
    if (defaultValue === undefined || isNaN(defaultValue))
    {
        throw "Default Value Must be defined as a number."
    }
    
    var value = defaultValue;
    
    if (environmentValue === undefined || isNaN(environmentValue)) {
        if (configValue === undefined || isNaN(configValue)) {
            Debug("Warning falling back to 0 since a value could be determined from config file or environment variable.");
            value = 0;
        } else {
            value = Number(globalSettings.thinkTime);
        }
    } else {
        value = Number(environmentValue);
    }

    return value;
}

/**
 * Generates a random number.
 * @param {number} min the min value (Inclusive)
 * @param {number} max the max value (Inclusive)
 * @returns number
 */
 export function Random(min=1, max=100) {
    if (min==null && max==null)
    {
        return 0;  
    }

    if (max == null) {
        max = min;
        min = 0;
      }

    return Math.floor(Math.random() * (max - min + 1) + min)
 }