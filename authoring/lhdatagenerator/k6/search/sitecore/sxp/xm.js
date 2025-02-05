/**
* © 2021 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
*/

import exec from "k6/execution";
import http from 'k6/http';
import { check } from "k6";
import { Trend, Counter } from "k6/metrics";
import * as platform from "../sitecore.js"
import { Debug } from '../common/common.js';
import shortid from "../common/shortid.js";

// Define Counters
var loginTrend = new Trend("Login_Trend", true);
var loginPostTrend = new Trend("Login_Post_Trend", true);
var externalCallback = new Trend("External_Callback_Trend", true);
var loginCount = new Counter('Number_of_Logins');
var controlPanelTrend = new Trend("Control_Panel_Trend", true);
var controlPanelCount = new Counter('Number_of_Control_Panel_Pages');
var desktopTrend = new Trend("Desktop_Trend", true);
var desktopCount = new Counter('Number_of_Desktop_Pages');
var launchPadTrend = new Trend("LaunchPad_Trend", true);
var launchPadCount = new Counter('Number_of_LaunchPad_Pages');
var adminTrend = new Trend("Admin_Trend", true);
var adminCount = new Counter('Number_of_Admin_Pages');
var logsTrend = new Trend("Logs_Trend", true);
var logsCount = new Counter('Number_of_Logs_Pages');
var mediaLibraryTrend = new Trend("MediaLibrary_Trend", true);
var mediaLibraryCount = new Counter('Number_of_MediaLibrary_Pages');
var workboxTrend = new Trend("Workbox_Trend", true);
var workboxCount = new Counter('Number_of_Workbox_Pages');
var addItemTrend = new Trend("AddItem_Trend", true);
var addItemCount = new Counter('Number_of_AddItem_Calls');
var delItemTrend = new Trend("DelItem_Trend", true);
var delItemCount = new Counter('Number_of_DelItem_Calls');
var getItemTrend = new Trend("GetItem_Trend", true);
var getItemCount = new Counter('Number_of_GetItem_Calls');
var updateItemTrend = new Trend("UpdateItem_Trend", true);
var updateItemCount = new Counter('Number_of_UpdateItem_Calls');
var publishSmartTrend = new Trend("PublishSmart_Trend", true);
var publishSmartCount = new Counter('Number_of_PublishSmart_Calls');

/**
 * Redirects the login based on if it is traditional or id based/
 * @param {string} username Optional parameter, if not passed in will be read from the settings file.  Defines the user name used to perform a login.
 * @param {*} password Optional parameter, if not passed in will be read from the settings file.  Defines the password used to perform a login.
 * @param {*} siteRootUrl Optional parameter, if not passed in will be read from the settings file.  Defines the root url for the requests.
 * @param {*} params Optional parameter, if not passed in will be read from the settings file.  Defines the parameters that will be used for the request.
 */
export function Login(username, password, siteRootUrl, params) {
    if (platform.UseIdLogin())
    {
        platform.Debug("Id Sitecore Login")
        SitecoreIdLogin(username, password, siteRootUrl, params);
    } 
    else
    {
        platform.Debug("Traditional Sitecore Login")
        SitecoreLogin(username, password, siteRootUrl, params);
    }
}

/**
 * Login in using the traditional Sitecore Login
 * @param {string} username Optional parameter, if not passed in will be read from the settings file.  Defines the user name used to perform a login.
 * @param {*} password Optional parameter, if not passed in will be read from the settings file.  Defines the password used to perform a login.
 * @param {*} siteRootUrl Optional parameter, if not passed in will be read from the settings file.  Defines the root url for the requests.
 * @param {*} params Optional parameter, if not passed in will be read from the settings file.  Defines the parameters that will be used for the request.
 */
export function SitecoreLogin(username, password, siteRootUrl, params) {
    
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

     // Create Compatible Params
    params = platform.CreateDefaultParams(params, 'Sitecore Login');
    Debug('Params: ' + JSON.stringify(params));

     //GET: Sitecore Login Page
    var loginUrl = siteRootUrl + "/sitecore/login";
    let loginResponse = http.get(loginUrl, params);

    check(loginResponse, {
        "Sitecore Login Page response was 200": (r) => r.status == 200,
    });

     // Parse Require Information from Response
    var eventTarget =  loginResponse.html().find("input[name='__EVENTTARGET']").attr('value');
    var eventArgument =  loginResponse.html().find("input[name='__EVENTARGUMENT']").attr('value');
    var viewState =  loginResponse.html().find("input[name='__VIEWSTATE']").attr('value');
    var viewStateGenerator =  loginResponse.html().find("input[name='__VIEWSTATEGENERATOR']").attr('value');
    var eventValidation =  loginResponse.html().find("input[name='__EVENTVALIDATION']").attr('value');

    if(loginResponse.status == 200)
    {
        loginTrend.add(loginResponse.timings.duration);
    }

     // POST: Login Credentials
    var loginPost = {
        __EVENTTARGET:eventTarget,
        __EVENTARGUMENT:eventArgument,
        __VIEWSTATE:viewState,
        __VIEWSTATEGENERATOR:viewStateGenerator,
        __EVENTVALIDATION:eventValidation,
        UserName:username,
        LogInBtn: "Log+in",
        Password:password
    }

    var loginPostUrl = siteRootUrl + "/sitecore/login";
    var loginPostResponse = http.post(loginPostUrl, loginPost, params);

    check(loginPostResponse, {
        "Login Post response was 200": (r) => r.status == 200,
    });

    if(loginPostResponse.status == 200)
    {
        loginPostTrend.add(loginPostResponse.timings.duration);
        loginCount.add(1);
    }

    return loginPostResponse;
}

/**
 * Login using the Sitecore Identity Server
 * @param {string} username Optional parameter, if not passed in will be read from the settings file.  Defines the user name used to perform a login.
 * @param {*} password Optional parameter, if not passed in will be read from the settings file.  Defines the password used to perform a login.
 * @param {*} siteRootUrl Optional parameter, if not passed in will be read from the settings file.  Defines the root url for the requests.
 * @param {*} idRootUrl Optional parameter, if not passed in will be read from the settings file.  Defines the root url for the id server.
 * @param {*} params Optional parameter, if not passed in will be read from the settings file.  Defines the parameters that will be used for the request.
 */
export function SitecoreIdLogin(username, password, siteRootUrl, idRootUrl, params) {
    // Configure default parameters
    if (siteRootUrl === undefined) {
        siteRootUrl = platform.RootUrl();
    }

    if (idRootUrl === undefined) {
        idRootUrl = platform.idRootUrl();
    }

    if (username === undefined) {
        username = platform.DefaultAdminLoginUsername();
    }

    if (password === undefined) {
        password = platform.DefaultAdminLoginPassword();
    }

    // Create Params
    params = platform.CreateDefaultParams(params, 'Sitecore Login');
    Debug('Params: ' + JSON.stringify(params));

    // (Identity Server) GET: Identity Server (Allows extraction of Verification Token) ---------------------------------------------------------------------------------
    var idServer = idRootUrl + "/";
    var idServerResponse = http.get(idServer, params);
    check(idServerResponse, platform.Response200Check("ID Login"));

    // - Parse Require Information from Response
    var verificationToken = idServerResponse.html().find("input[name='__RequestVerificationToken']").attr('value');
    platform.Debug(`Verification Token: ${verificationToken}`);

     //  (Identity Server) POST: Identity Server (Sets the idsrv.session and idsrv cookies) -----------------------------------------------------------------------------
    // - Build Proper Header, Identity Servier is header sensative
    var idServerPostParams = platform.CreateDefaultParams({}, 'Sitecore Login');
    idServerPostParams.headers = {
        "content-type": "application/x-www-form-urlencoded",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    }

    // - Note: you have to work around a post bug, RememberLogin is in the form post 2 times, this blocks using a json object becaue the same key is repeated thus you have to build using a string
    var postTest = "ReturnUrl=&AccountPrefix=sitecore%5C&Username=" + username + "&Password=" + password + "&button=login&RememberLogin=true&__RequestVerificationToken=" + verificationToken + "&RememberLogin=false"
    platform.Debug(`Id Post: ${postTest}`);
    var idServerPostResponse = http.post(idServer, postTest, idServerPostParams);
    check(idServerPostResponse, platform.Response200Check("ID Login Post"));

    // (Sitecore) Get: Login Page (Allows extraction of EXTERNALLOGIN_URL) ----------------------------------------------------------------------------------------------
    var sitecore = siteRootUrl + "/sitecore/";
    var sitecoreResponse = http.get(sitecore, params);
    check(sitecoreResponse, platform.Response200Check("Sitecore Login"));
    
    // - Extract External Login Url
    var externalLoginUrl =  sitecoreResponse.html().find("form").attr("action");
    var sitecoreExternalLoginUrl = siteRootUrl + externalLoginUrl;
    platform.Debug('External Login URL: ' + sitecoreExternalLoginUrl);

    // (Sitecore) Post: External Login (Allows Extraction of code, id_token, access_token, state, session_state) --------------------------------------------------------
    let sitecoreExternalLoginResponse = http.post(sitecoreExternalLoginUrl, "", params);
    var code =  sitecoreExternalLoginResponse.html().find("input[name='code']").attr('value');
    var idToken =  sitecoreExternalLoginResponse.html().find("input[name='id_token']").attr('value');
    var accessToken =  sitecoreExternalLoginResponse.html().find("input[name='access_token']").attr('value');
    var state =  sitecoreExternalLoginResponse.html().find("input[name='state']").attr('value');
    var sessionState =  sitecoreExternalLoginResponse.html().find("input[name='session_state']").attr('value');
    platform.Debug('CODE: ' + code);
    platform.Debug('ID_TOKEN: ' + idToken);
    platform.Debug('ACCESS_TOKEN: ' + accessToken);
    platform.Debug('STATE: ' + state);
    platform.Debug('SESSION_STATE: ' + sessionState);
    
    // Validate Response Status and Access Token has a value.
    check(sitecoreExternalLoginResponse, 
        {
            "Sitecore External Login Post response was 200": (r) => r.status == 200,
            "Sitecore Login Access Token exist": (r) => {
                if (accessToken === undefined)
                {
                    console.log("\x1b[31m**************************************************************\x1b[0m")
                    console.log("\x1b[31m* Access Token was not found in response.                    *\x1b[0m")
                    console.log("\x1b[31m* Typically, indicates required users are missing            *\x1b[0m")
                    console.log("\x1b[31m* Ensure that test Author and Admin users have been created. *\x1b[0m")
                    console.log("\x1b[31m* Use scripts located in /test/CM/setup to configure users.  *\x1b[0m")
                    console.log("\x1b[31m**************************************************************\x1b[0m")
                    return false;
                }
                else
                {
                    if (accessToken.length > 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    );


    // (Sitecore) POST: Login Credentials (Set Cookies OpenIdConnect and .AspNet.ExternalCookie) ------------------------------------------------------------------------
    var signInPost = {
        code:code,
        id_token:idToken,
        access_token:accessToken,
        token_type:"Bearer",
        expires_in:3600,
        scope:"openid sitecore.profile",
        state:state,
        session_state:sessionState,
    }

     // - Disable K6 automatically following Redirects
    var signIParams = platform.CreateDefaultParams({}, 'Sitecore Login');
    signIParams.headers = {
        "upgrade-insecure-requests":1,
    }
    signIParams.redirects=0;

    var sitecoreSignInUrl = siteRootUrl + "/identity/signin";
    var sitecoreSignInResponse = http.post(sitecoreSignInUrl, signInPost, signIParams);

    // (Sitecore) Get: Handle Site redirection (Sets Cookie .AspNet.Cookies) --------------------------------------------------------------------------------------------
    // - Produces a Redirect that points to a non-https result which will cause a 307 redirect which k6 does not handle
    var externalCallbackResponse = http.get(siteRootUrl + "/identity/externallogincallback?ReturnUrl=&sc_site=shell&authenticationSource=Default", signIParams)
    externalCallback.add(externalCallbackResponse.timings.duration)


    // (Sitecore) GET: Launch Pad (Default User Starting Point) --> User is now logged in
    var sitecoreLaunchPad = siteRootUrl + "/sitecore/client/Applications/Launchpad?sc_lang=en";
    var pageRedirectResponse = http.get(sitecoreLaunchPad, params);

    check(pageRedirectResponse, {
        "Launchpad response was 200": (r) => r.status == 200,
        "Launchpad page title": (r) => {
            // For compatibility between XM and XP you have to verify with a different title
            // XM
            if (r.body.includes("Sitecore Experience Management")) {
                return true;
            }
            
            // XP
            if (r.body.includes("Sitecore Experience Platform")) {
                return true;
            }

            return false;
        },
    });

    // Set Metrics
    if(sitecoreExternalLoginResponse.status == 200)
    {
        loginTrend.add(sitecoreResponse.timings.duration + idServerResponse.timings.duration);
        loginPostTrend.add(sitecoreExternalLoginResponse.timings.duration + idServerPostResponse.timings.duration + sitecoreSignInResponse.timings.duration);
        loginCount.add(1);
    }
}

/**
 * Navigate to Control Panel page 
 */
export function ControlPanel() {
    
    // Create Compatible Parameters
    var params = platform.CreateParams('Control Panel');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get: Control Panel Page
    let response = http.get(platform.RootUrl() + "/sitecore/client/Applications/ControlPanel.aspx?sc_bw=1", params);

    // Validate Response
    check(response, {
        "Control Panel is status 200": (r) => r.status === 200,
        "Control Panel verify page title": (r) => r.body.includes("Control Panel"),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        controlPanelTrend.add(response.timings.duration);
        controlPanelCount.add(1);
    }
}

/**
 * Navigate to Desktop page 
 */

export function Desktop() {
    
    // Create Compatible Parameters
    var params = platform.CreateParams('Desktop');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get: Desktop Page
    let response = http.get(platform.RootUrl() + "/sitecore/shell/default.aspx", params);

    // Validate Response
    check(response, {
        "Desktop is status 200": (r) => r.status === 200,
        "Desktop verify page title": (r) => r.body.includes("Desktop"),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        desktopTrend.add(response.timings.duration);
        desktopCount.add(1);
    }
}

export function LaunchPad() {
    
    // Create Compatible Parameters
    var params = platform.CreateParams('LaunchPad');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get: LanuchPad Page
    //<p class="chakra-text css-1qvadc3">qepreprodpea332-pp2o8d8t3800-pp2o8d8t380151c-b</p>
    let tenantName = platform.RootUrl().replace("https://xmc-", "").replace(".sitecorecloud.io", "");
    let url = "https://xmapps-beta.sitecorecloud.io" + "?tab=1" + "&tenantName=" + tenantName;
    let response = http.get(url, params);
    platform.Debug(`Url: ${url}`);
    platform.Debug(`Title: ${response.html().find("p").first().text()}`);
    platform.Debug(`Title found: ${response.body.includes('<p class="chakra-text css-1qvadc3">qepreprodpea332-pp2o8d8t3800-pp2o8d8t380151c-b</p>')}`);
    platform.Debug(`Response: ${response.body}`);

    // Validate Response
    check(response, {
        "Lanchpad is status 200": (r) => r.status === 200,
        "Launchpad page title": (r) => {
            // For compatibility between XM and XP you have to verify with a different title
            // XM
            if (r.body.includes(`<p class="chakra-text css-1qvadc3">${tenantName}</p>`)) {
                return true;
            }
            
                // // XP
                // if (r.body.includes("Sitecore Experience Platform")) {
                //     return true;
                // }

            return false;
        },
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        launchPadTrend.add(response.timings.duration);
        launchPadCount.add(1);
    }
}

/**
 * Navigate to Workbox page 
 */

export function Workbox() {

    // Create Compatible Parameters
    var params = platform.CreateParams('Workbox');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get: WorkboxDefault Page
    let WorkboxDefaultRes = http.get(platform.RootUrl() + "/sitecore/shell/Applications/Workbox.aspx?sc_bw=1", params);

    // Validate Response
    check(WorkboxDefaultRes, platform.Response200Check("WorkboxDefault"));

    // Get: WorkboxPreview Page
    let WorkboxPreviewRes = http.get(platform.RootUrl() + "/sitecore/shell/default.aspx?xmlcontrol=Workbox&mo=preview", params);

    // Validate Response
    check(WorkboxPreviewRes, {
        "Workbox Preview is status 200": (r) => r.status === 200,
        "Workbox Preview verify page title": (r) => r.body.includes("Workbox"),
    });

    // Set K6 Counters
    if (WorkboxDefaultRes.status == 200 && WorkboxPreviewRes.status == 200)
    {
        workboxTrend.add(WorkboxDefaultRes.timings.duration+WorkboxPreviewRes.timings.duration);
        workboxCount.add(1);
    }   
}

/**
 * Navigate to Media Library page 
 */
export function MediaLibrary() {
    
    // Create Compatible Parameters
    var params = platform.CreateParams('MediaLibrary');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get: MediaShop Page
    let mediaShopResponse = http.get(platform.RootUrl() + "/sitecore/shell/Applications/Media/MediaShop.aspx?sc_bw=1", params);

    // Validate Response
    check(mediaShopResponse, platform.Response200Check("MediaShop"));      

    // Get: MediaDefault Page
    let mediaDefaultResponse = http.get(platform.RootUrl() + "/sitecore/shell/Applications/Content%20Manager/default.aspx?he=Media+Library&pa=1&ic=Applications%2f16x16%2fphoto_scenery.png&mo=media&ro=%7b3D6658D8-A0BF-4E75-B3E2-D050FABCF4E1%7d&sc_bw=1", params);

    // Validate Response
    check(mediaDefaultResponse, {
        "MediaDefault Preview is status 200": (r) => r.status === 200,
        "MediaDefault Preview verify page title": (r) => r.body.includes("Media Library"),
    });

    // Set K6 Counters
    if (mediaShopResponse.status == 200 && mediaDefaultResponse.status == 200)
    {
        mediaLibraryTrend.add(mediaShopResponse.timings.duration + mediaDefaultResponse.timings.duration);
        mediaLibraryCount.add(1);
    }
}

/**
 * Navigate to Administration Tools page 
 */

export function Admin() {
    // Create Compatible Parameters
    var params = platform.CreateParams('Admin');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get: Admin Page
    let response = http.get(platform.RootUrl() + "/sitecore/admin", params);

    // Validate Response
    check(response, {
        "Administration is status 200": (r) => r.status === 200,
        "Administration verify page title": (r) => r.body.includes("Administration"),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        adminTrend.add(response.timings.duration);
        adminCount.add(1);
    }
}


/**
 * Navigate to Administration Tools - Logs page 
 */

export function Logs() {
    // Create Compatible Parameters
    var params = platform.CreateParams('Logs');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get: Logs Page
    let response = http.get(platform.RootUrl() + "/sitecore/admin/Logs.aspx", params);

    // Validate Response
    check(response, {
        "Logs is status 200": (r) => r.status === 200,
        "Logs verify page title": (r) => r.body.includes("Logs"),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        logsTrend.add(response.timings.duration);
        logsCount.add(1);
    }
}

/**
 * Item Name Generator based on range
 */
export function GenerateItemName(itemNameBase) {
    var suffix = shortid.generate();
    return `${itemNameBase}-${suffix}`
}

/**
 * LhDataGenerator - Add An Item 
 */

export function AddItem(itemName, parentPath, templateName) {
    // Create Compatible Parameters
    var params = platform.CreateParams('AddItem');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Add Item API
    var url = `/performance/additem?name=${itemName}&parentPath=${parentPath}&templateName=${templateName}`;
    platform.Debug(`Root= ${platform.RootUrl()} URL = ${url}`);
    let response = http.get(platform.RootUrl() + url, params);
    platform.Debug(`Response = ${response.body}`);

    // Validate Response
    check(response, platform.Response200Check("AddItem"));
    check(response, {
        'verify additem api success': (r) => r.body.includes('"Success":true'),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        addItemTrend.add(response.timings.duration);
        addItemCount.add(1);
    }
}

/**
 * LhDataGenerator - Delete An Item 
 */

export function DelItem(itemPath) {
    // Create Compatible Parameters
    var params = platform.CreateParams('DelItem');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Delete Item API
    var url = `/performance/delitem?itemPath=${itemPath}`;
    platform.Debug(`Root= ${platform.RootUrl()} URL = ${url}`);
    let response = http.get(platform.RootUrl() + url, params);
    platform.Debug(`Response = ${response.body}`);

    // Validate Response
    check(response, platform.Response200Check("DelItem"));
    check(response, {
        'verify delitem api success': (r) => r.body.includes('"Success":true'),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        delItemTrend.add(response.timings.duration);
        delItemCount.add(1);
    }
}

/**
 * LhDataGenerator - Get An Item 
 */

export function GetItem(itemPath) {
    // Create Compatible Parameters
    var params = platform.CreateParams('GetItem');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get Item API
    var url = `/performance/getitem?itemPath=${itemPath}`;
    platform.Debug(`Root= ${platform.RootUrl()} URL = ${url}`);
    let response = http.get(platform.RootUrl() + url, params);
    platform.Debug(`Response = ${response.body}`);

    // Validate Response
    check(response, platform.Response200Check("GetItem"));
    check(response, {
        'verify getitem api success': (r) => r.body.includes('"Success":true'),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        getItemTrend.add(response.timings.duration);
        getItemCount.add(1);
    }
}

/**
 * LhDataGenerator - Update An Item 
 */

export function UpdateItem(itemPath) {
    // Create Compatible Parameters
    var params = platform.CreateParams('UpdateItem');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get Item API
    var url = `/performance/updateitem?itemPath=${itemPath}`;
    platform.Debug(`Root= ${platform.RootUrl()} URL = ${url}`);
    let response = http.get(platform.RootUrl() + url, params);
    platform.Debug(`Response = ${response.body}`);

    // Validate Response
    check(response, platform.Response200Check("UpdateItem"));
    check(response, {
        'verify updateitem api success': (r) => r.body.includes('"Success":true'),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        updateItemTrend.add(response.timings.duration);
        updateItemCount.add(1);
    }
}
/**
 * LhDataGenerator - Publish Smart 
 */

export function PublishSmart() {
    // Create Compatible Parameters
    var params = platform.CreateParams('PublishSmart');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Publish Smart API
    var url = "/performance/publishsmart?wait=true";
    platform.Debug(`Root= ${platform.RootUrl()} URL = ${url}`);
    let response = http.get(platform.RootUrl() + url, params);
    platform.Debug(`Response = ${response.body}`);

    // Validate Response
    check(response, platform.Response200Check("PublishSmart"));
    check(response, {
        'verify publishsmart api success': (r) => r.body.includes('"Success":true'),
    });
    
    // Set K6 Counters
    if (response.status == 200)
    {
        publishSmartTrend.add(response.timings.duration);
        publishSmartCount.add(1);
    }
}

/**
 * Create a New User
 * @param {string} newUsername - Username for the new user to be created.
 * @param {string} role - Optional parameter. Defines the role for the new user. If not passed in no role will be assigned to the user.
 * @param {*} password - Optional parameter, if not passed in will be read from the settings file.  Defines the password for the new user. 
 * @example
 * CreateUser("Admin1","Sitecore Local Administrators","b");
 * CreateUser("Author1","Author");
 */

export function CreateUser(newUserName, role, password) {
    
    if (role == undefined) {
        role = "";
    }
    else
    {
        role="sitecore\\" + role;
    }
    if (password == undefined) {
        password = platform.DefaultAdminLoginPassword();
    }

    // Create Compatible Parameters
    var params = platform.CreateParams('SelectCreateUser');
    platform.Debug('Params: ' + JSON.stringify(params));

    // Get: Select Create New User 
    var response = http.get(platform.RootUrl() + "/sitecore/shell/Applications/Security/CreateNewUser/CreateNewUser.aspx?do=sitecore ", params);

    // Validate Response
    check(response, platform.Response200Check("SelectCreateUser"));

    // Parse Required Information from Response
    var csrfToken = response.html().find("input[name='__CSRFTOKEN']").attr('value');
    var eventTarget = response.html().find("input[name='__EVENTTARGET']").attr('value');
    var eventArgument = response.html().find("input[name='__EVENTARGUMENT']").attr('value');
    var viewState = response.html().find("input[name='__VIEWSTATE']").attr('value');
    var viewStateGenerator = response.html().find("input[name='__VIEWSTATEGENERATOR']").attr('value');
    var eventValidation = response.html().find("input[name='__EVENTVALIDATION']").attr('value');
    var profile = response.html().find("#CreateUserWizard_CreateUserStepContainer_Profile > option").attr('value');
    
    // Create Compatible Params
    params = platform.CreateDefaultParams({}, 'CreateUser');
    params.headers = {
        "content-type": "application/x-www-form-urlencoded",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate, br"
    };
    platform.Debug('Params: ' + JSON.stringify(params));

    // POST: CreateUser request body
    let createUserPost = {
        __CSRFTOKEN: csrfToken,
        __EVENTTARGET: eventTarget,
        __EVENTARGUMENT: eventArgument,
        __VIEWSTATE: viewState,
        __VIEWSTATEGENERATOR: viewStateGenerator,
        __EVENTVALIDATION: eventValidation,
        RolesValue: role,
        "CreateUserWizard$CreateUserStepContainer$UserName": newUserName,
        "CreateUserWizard$CreateUserStepContainer$Domain": "sitecore",
        "CreateUserWizard$CreateUserStepContainer$FullName": newUserName + " " + newUserName,
        "CreateUserWizard$CreateUserStepContainer$Email": newUserName + "." + newUserName + "@sitecore.net",
        "CreateUserWizard$CreateUserStepContainer$Description": "",
        "CreateUserWizard$CreateUserStepContainer$Password": "b",
        "CreateUserWizard$CreateUserStepContainer$ConfirmPassword": "b",
        "CreateUserWizard$CreateUserStepContainer$Profile": profile,
        "CreateUserWizard$__CustomNav0$btnMoveNext": "Next"
    };

    // POST: Create New User 
    var response = http.post(platform.RootUrl() + "/sitecore/shell/Applications/Security/CreateNewUser/CreateNewUser.aspx?do=sitecore", createUserPost, params);

    // Validate Response
    check(response, {
        'User creation was success': (r) => r.html().find('table > tbody > tr:nth-child(1) > td > b').text().includes("The user has been successfully created"),
    });

}

export const ContentTreePaths = [
    "/sitecore/content/Home/TestItems001",
    "/sitecore/content/Home/TestItems002",
    "/sitecore/content/Home/TestItems003",
    "/sitecore/content/Home/TestItems004",
    "/sitecore/content/Home/TestItems005",
    "/sitecore/content/Home/TestItems006",
    "/sitecore/content/Home/TestItems007",
    "/sitecore/content/Home/TestItems008",
    "/sitecore/content/Home/TestItems009",
    "/sitecore/content/Home/TestItems010",
    "/sitecore/content/Home/TestItems011",
    "/sitecore/content/Home/TestItems012",
    "/sitecore/content/Home/TestItems013",
    "/sitecore/content/Home/TestItems014",
    "/sitecore/content/Home/TestItems015",
    "/sitecore/content/Home/TestItems016",
    "/sitecore/content/Home/TestItems017",
    "/sitecore/content/Home/TestItems018",
    "/sitecore/content/Home/TestItems019",
    "/sitecore/content/Home/TestItems020"
];

export function CreateContentTreePaths() {
    ContentTreePaths.forEach(AddFolder);
}

export function AddFolder(itemPath) {
    let temp = itemPath.split("/");
    let parentPath = `/${temp[1]}/${temp[2]}/${temp[3]}`
    let itemName = temp[4]
    let templateName = "Common/Folder"
    platform.AddItem(itemName, parentPath, templateName);
}

export function DeleteContentTreePaths() {
    ContentTreePaths.forEach(DelFolder);
}

export function DelFolder(itemPath) {
    platform.DelItem(itemPath);
}

/**
 * Get Random Parent Path
 */
export function GetRandomContentParentPath() {
  let max = ContentTreePaths.length;
  var index = Math.floor(Math.random() * max);
  //console.log(`Index = ${index}`);
  let path = ContentTreePaths[index];
  //console.log(`Path = ${path}`);
  return path;
}

/**
 * Get K6 Shared Data Host
 */
export function GetSharedDataHost() {
    var offset = ((exec.vu.idInInstance % sites.length) % __ENV.NUM_SHARED_DATA_HOSTS) + 1;
    platform.Debug(`VU=${exec.vu.idInInstance} OFFSET=${offset}`);
    return `${__ENV.SHARED_DATA_HOST_PREFIX}${offset}${__ENV.SHARED_DATA_HOST_SUFFIX}`
//   return platform.SharedDataHost();
}

/**
 * Get Random Item from K6 Shared Data
 */
export function GetRandomItem() {
  // Reference: https://github.com/tidwall/gjson#path-syntax
    var params = platform.CreateDefaultParams(params, "K6-SD-SVC-GetRandomItem");
    var site = platform.Site(); 
  var response = http.get(
    `${GetSharedDataHost()}/api/contentitems/site/random/${site}`,
    params
  );
  var path = response.json("name");
  return path;
}

/**
 * Get Random Item from K6 Shared Data for updates
 */
export function GetRandomItemForUpdate() {
  // Reference: https://github.com/tidwall/gjson#path-syntax
  var params = platform.CreateDefaultParams(
    params,
    "K6-SD-SVC-GetRandomItemForUpdate"
    );
    
    var site = platform.Site(); 
  var response = http.get(
    `${GetSharedDataHost()}/api/contentitems/site/random/${site}`,
    params
  );
  var res = response;
  return res;
}

/**
 * Get Add Item to K6 Shared Data
 */
export function AddItemToSharedData(name, isDefault = false) {
  const url = `${GetSharedDataHost()}/api/contentitems`;
  const payload = JSON.stringify({
      name: name,
      site: platform.Site(),
    isDefaultItem: isDefault,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: {
      ReportName: "K6-SD-SVC-AddItemToSharedData",
    },
  };

  var res = http.post(url, payload, params);
  check(res, {
    "is status 201: Added Item to Shared Data": (r) => r.status === 201,
  });
}

/**
 * Get Delete Item from K6 Shared Data
 */
export function DelItemFromSharedData(id) {
  const url = `${GetSharedDataHost()}/api/contentitems/${id}`;

  var  params = platform.CreateDefaultParams(
    params,
    "K6-SD-SVC-DelItemFromSharedData"
  );
  var res = http.del(url,"",params);
  check(res, {
    "is status 204: Deleted Item from Shared Data": (r) => r.status === 204,
  });
}

/**
 * Get Update Item in K6 Shared Data
 */
export function UpdateItemInSharedData(id, name, isDefault = false) {
  const url = `${GetSharedDataHost()}/api/contentitems`;
  const payload = JSON.stringify({
    id: id,
    name: name,
    isDefaultItem: isDefault,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: {
      ReportName: "K6-SD-SVC-AddItemToSharedData",
    },
  };

  var res = http.put(url, payload, params);
  check(res, {
    "is status 204: Updated Item in Shared Data": (r) => r.status === 204,
  });
}