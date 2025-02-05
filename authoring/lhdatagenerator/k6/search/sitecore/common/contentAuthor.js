/**
 * © 2020 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';


const authors = new SharedArray("Content Authors", function () {
    let data = papaparse.parse(open('../../data/contentauthors.csv'), { header: true }).data;
    return data;
});

/**
 * @description Get a random Content Author.
 */

export function GetContentAuthor() {
    return authors[Math.floor(Math.random() * authors.length)];
}

