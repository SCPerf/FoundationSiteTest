import http from 'k6/http';
import { check } from "k6";
import { Trend } from "k6/metrics";
import * as platform from "../sitecore.js"
import { Debug } from '../common/common.js';
import { URL } from "../common/urlhelper.js"


// Define Counters
var sitecoreAdministrationTrend = new Trend("Sitecore_Administration_Trend", true);
var auth0Trend = new Trend("Auth0_Trend", true);
var auth0SetUsernameTrend = new Trend("Auth0_Set_Username_Trend", true);
var auth0SetPasswordTrend = new Trend("Auth0_Set_Password_Trend", true);
var sitecoreLaunchPadTrend = new Trend("Sitecore_LaunchPad_Trend", true);
var loginTrend = new Trend("Login_Trend", true);

export function LoginAuth0(username, password, siteRootUrl, params) {
    // Configure default parameters
    if (siteRootUrl === undefined) {
        siteRootUrl = platform.RootUrl();
    }

    if (username === undefined) {
        username = platform.DefaultAdminLoginUsername();
    }

    if (password === undefined) {
        password = platform.DefaultAdminLoginPassword();
    }

    Debug("RootURL: " + siteRootUrl)
    Debug("UserName: " + username)
    Debug("Password: " + password)

    // Initialize Variables
    var start = new Date().getTime();
    var end = new Date().getTime();

    // Create Params
    params = platform.CreateDefaultParams(params, 'Sitecore Login');
    Debug('Params: ' + JSON.stringify(params));

    
    // Part 01 *******************************************************************************************************
    // *** Sitecore Administration
    // --> (GET) /sitecore : 302 
    // --> (GET) /identity/login/shell/Auth0 : 200
    var url = siteRootUrl + "/sitecore";
    start = new Date().getTime();
    var responseAdministration = http.get(url, params);
    end = new Date().getTime();

    // - Validate
    check(responseAdministration, platform.Response200Check("Sitecore Administration"));

    // - Counters
    var timeSitecoreAdministration = end - start;
    sitecoreAdministrationTrend.add(timeSitecoreAdministration);


    // Part 02 *******************************************************************************************************
    // ***  Auth0
    // --> (POST) /identity/externallogin : 302
    // --> (GET) https://<Auth0LoginURL>/authorize : 302
    // --> (GET) https://<Auth0LoginUrl>/u/login/identifier : 200
    var postParms = platform.CreateDefaultParams({}, 'Sitecore Login');
    postParms.headers = {
        "content-type": "application/x-www-form-urlencoded",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    }

    var post = ""
    url = siteRootUrl + "/identity/externallogin?authenticationType=Auth0&ReturnUrl=%2fidentity%2fexternallogincallback%3fReturnUrl%3d%26sc_site%3dshell%26authenticationSource%3dDefault&sc_site=shell";
    start = new Date().getTime();
    var responseAuth0 = http.post(url, post, postParms);
    end = new Date().getTime();
    
    // - Validate
    check(responseAuth0, platform.Response200Check("Auth0 Login Request"));
    
    // - Extract
    var state = responseAuth0.html().find("input[name='state']").attr('value');
    var auth0LoginUrl = new URL(responseAuth0.url).host;

    // - Counters
    var timeAuth0 = end - start;
    auth0Trend.add(timeAuth0);


    // Part 03 *******************************************************************************************************
    // **** Auth0 Set Username
    // --> (POST) https://<Auth0LoginURL>/u/login/identifier : 302
    // --> (GET) https://<Auth0LoginURL>/u/login/password : 200
    postParms = platform.CreateDefaultParams({}, 'Sitecore Login');
    postParms.headers = {
        "content-type": "application/x-www-form-urlencoded",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    }

    post = {
        "state": state,
        "username": username,
        "js-available": "true",
        "webauthn-available": "true",
        "is-brave": "false",
        "webauthn-platform-available": "false",
        "action": "default",
    }

    url = "https://" + auth0LoginUrl + "/u/login/identifier?state=" + state;

    start = new Date().getTime();
    var responseAuth0SetUsername = http.post(url, post, postParms);
    end = new Date().getTime();

    // - Validate
    check(responseAuth0SetUsername, platform.Response200Check("Auth0 Set Username"));

    // - Counters
    var timeAuth0SetUsername = end - start;
    auth0SetUsernameTrend.add(timeAuth0SetUsername);


    // Part 05 *******************************************************************************************************
    // **** Call Auth0 Set Password
    // --> (POST) https://<Auth0LoginURL>/u/login/password : 302
    // --> (GET) https://<Auth0LoginURL>/authorize/resume : 200
    postParms = platform.CreateDefaultParams({}, 'Sitecore Login');
    postParms.headers = {
        "content-type": "application/x-www-form-urlencoded",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    }

    post = {
        "state": state,
        "username": username,
        "password": password,
        "action": "default",
    }

    url = "https://" + auth0LoginUrl + "/u/login/password?state=" + state;
    start = new Date().getTime();
    var responseAuth0SetPassword = http.post(url, post, postParms);
    end = new Date().getTime();

    // - Validate
    check(responseAuth0SetPassword, platform.Response200Check("Auth0 Set Password"));

    // - Extract
    //var idtoken = responseAuth0SetPassword.html().find("input[name='id_token']").attr('value');
    var code = responseAuth0SetPassword.html().find("input[name='code']").attr('value');
    state = responseAuth0SetPassword.html().find("input[name='state']").attr('value');
    
    // - Counters
    var timeAuth0SetPassword = end - start;
    auth0SetPasswordTrend.add(timeAuth0SetPassword);
    
    // Part 06 *******************************************************************************************************
    // **** Call Sitecore Sign In
    // --> (POST) /identity/signin-auth0 : 302
    // --> (GET) /identity/externallogincallback : 302
    // --> (GET) /sitecore/client/Applications/Launchpad : 308 (HTTP -> HTTPS)
    // --> (GET) /sitecore/client/Applications/Launchpad : 200
    postParms = platform.CreateDefaultParams({}, 'Sitecore Login');
    postParms.headers = {
        "content-type": "application/x-www-form-urlencoded",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    }

    // Correction for issue with k6 not following 308 using https
    // postParms.redirects = 2;

    post = {
        "code": code,
        "state": state,
    }

    platform.ApplyThinkTime(platform.Random(1, 3));

    url = siteRootUrl + "/identity/signin-auth0";
    start = new Date().getTime();
    var responseSitecoreLaunchPath = http.post(url, post, postParms);
    end = new Date().getTime();

    // // Correction for issue with k6 not following 308 using https
    // postParms = platform.CreateDefaultParams({}, 'Sitecore Login');
    // url = siteRootUrl + "/sitecore/client/Applications/Launchpad?sc_lang=en";
    // responseSitecoreLaunchPath = http.get(url, postParms)

    if (responseSitecoreLaunchPath.status != 200) {
        platform.Debug(`Cannot login ${siteRootUrl}`);
    }
    // - Validate
    check(responseSitecoreLaunchPath, {
        "Sitecore Dashboard response was 200": (r) => r.status == 200,
        'Verify Dashboard Title': (r) => r.body.includes('XM Apps Dashboard')
    });

    // - Counters
    var timeSitecoreLaunchPath = end - start
    sitecoreLaunchPadTrend.add(timeSitecoreLaunchPath);
    loginTrend.add(timeSitecoreAdministration + timeAuth0 + timeAuth0SetUsername + timeAuth0SetPassword + timeSitecoreLaunchPath);
}