/**
 * © 2020 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';

/**
 * @description Get Browse Users data in a shared array.
 */
const browseUsers = new SharedArray("Browse Users", function () {
    let data = papaparse.parse(open('../../data/browseusers.csv'), { header: true }).data;
    return data;
});

/**
 * @description Get a random Browse User.
 */
export function GetBrowseUser() {
    return browseUsers[Math.floor(Math.random() * browseUsers.length)];
}