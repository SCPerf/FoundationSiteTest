// -----------------------------------------------------------------------
// <copyright file="SitecoreVersion.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator.Models
{
    /// <summary>
    /// Class SitecoreVersion.
    /// </summary>
    public class SitecoreVersion
    {
        /// <summary>
        /// Gets or sets the full name.
        /// </summary>
        /// <value>The full name.</value>
        public string FullName { get; set; }

        /// <summary>
        /// Gets or sets the name.
        /// </summary>
        /// <value>The name.</value>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the major version.
        /// </summary>
        /// <value>The major version.</value>
        public string MajorVersion { get; set; }

        /// <summary>
        /// Gets or sets the revision.
        /// </summary>
        /// <value>The revision.</value>
        public string Revision { get; set; }
    }
}