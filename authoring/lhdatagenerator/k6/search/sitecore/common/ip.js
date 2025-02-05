/**
 * © 2020 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

const Addresses =  open("../../data/ip.txt").split("\r\n");

/**
 * @description Get a random IP Address.
 */
export function GetRandomIpAddress()
{
    let rowno = Math.floor(Math.random() * Addresses.length);
    return Addresses[rowno];
}