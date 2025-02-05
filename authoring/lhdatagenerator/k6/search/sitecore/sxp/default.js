/**
 * © 2020 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import http from 'k6/http';
import { check } from "k6";
import { Trend, Rate } from "k6/metrics";
import * as platform from "../sitecore.js"
import { Debug } from '../common/common.js';

// Custom Counters
var defaultHomeTrend = new Trend("Default Home Trend", true);
const failRate = new Rate('failed requests');

/**
 * @description                 Creates a web request to the default Sitecore Home Page
 * @param {string} siteRootUrl  The url to the site.
 * @param {object} params       Headers sent with web requests 
 */
export function Default_Home(siteRootUrl, params) {
    if (siteRootUrl === undefined) {
        siteRootUrl = platform.RootUrl();
    }
    
    // Create Compatible Params
    params = platform.CreateDefaultParams(params, 'Sitecore Default Home');
    Debug('Params: ' + JSON.stringify(params));
    
    // Create Request
    var url = siteRootUrl;
    let response = http.get(url, params);
    
    // Update Counters
    failRate.add(response.status !== 200);
    defaultHomeTrend.add(response.timings.duration);
    
    // Validate Response
    check(response, {
        "Response was 200": (r) => r.status == 200,
    });

    return response;
}