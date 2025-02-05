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