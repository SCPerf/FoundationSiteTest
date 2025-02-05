// -----------------------------------------------------------------------
// <copyright file="FrameworkVersion.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator.Models
{
    using System;

    /// <summary>
    /// FrameworkVersion.
    /// </summary>
    public class FrameworkVersion
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="FrameworkVersion"/> class.
        /// </summary>
        public FrameworkVersion()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FrameworkVersion"/> class.
        /// </summary>
        /// <param name="version">The version.</param>
        public FrameworkVersion(Version version)
        {
            this.MajorVersion = version.Major;
            this.MinorVersion = version.Minor;
            this.Build = version.Build;
            this.Revision = version.Revision;
        }

        /// <summary>
        /// Gets or sets the major version.
        /// </summary>
        /// <value>The major version.</value>
        public int MajorVersion { get; set; }

        /// <summary>
        /// Gets or sets the major version.
        /// </summary>
        /// <value>The major version.</value>
        public int MinorVersion { get; set; }

        /// <summary>
        /// Gets or sets the revision.
        /// </summary>
        /// <value>The revision.</value>
        public int Revision { get; set; }

        /// <summary>
        /// Gets or sets the revision.
        /// </summary>
        /// <value>The revision.</value>
        public int Build { get; set; }
    }
}