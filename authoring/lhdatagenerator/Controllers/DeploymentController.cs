// -----------------------------------------------------------------------
// <copyright file="DeploymentController.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator.Controllers
{
    using System;
    using System.Reflection;
    using System.Web.Mvc;

    using Sitecore.Configuration;
    using Sitecore.Performance.LhDataGenerator.Models;

    /// <summary>
    /// Class DeploymentController.
    /// </summary>
    /// <seealso cref="System.Web.Mvc.Controller" />
    public class DeploymentController : Controller
    {
        /// <summary>
        /// Versions this instance.
        /// </summary>
        /// <returns>ActionResult.</returns>
        public ActionResult Version()
        {
            var result = new RequestResult();
            result.LogInfo("Version: Start");

            SitecoreVersion version;
            try
            {
                version = ParseVersionInformation(About.VersionInformation());
            }
            catch
            {
                version = null;
            }

            result.Success = true;
            result.LogInfo($"FullName: {version.FullName}");
            result.LogInfo("Version: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Frameworks the version.
        /// </summary>
        /// <returns>ActionResult.</returns>
        public ActionResult FrameworkVersion()
        {
            var result = new RequestResult();
            result.LogInfo("FrameworkVersion: Start");

            var version = Assembly.GetExecutingAssembly().GetName().Version;
            var versionWrapper = new FrameworkVersion(version);

            result.Success = true;
            result.LogInfo($"Version: {versionWrapper.Build}.{versionWrapper.MajorVersion}.{versionWrapper.MinorVersion}.{versionWrapper.Revision}");
            result.LogInfo("FrameworkVersion: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        private static SitecoreVersion ParseVersionInformation(string versionInformation)
        {
            var version = new SitecoreVersion { FullName = versionInformation };
            var versionParts = versionInformation.Split(new[] { " " }, StringSplitOptions.RemoveEmptyEntries);

            if (versionParts.Length == 4)
            {
                version.Name = versionParts[0].Trim();
                version.MajorVersion = versionParts[1].Trim();
                version.Revision = versionParts[3].Replace("{", string.Empty).Replace(")", string.Empty).Replace("rev.", string.Empty).Trim();
            }

            return version;
        }
    }
}