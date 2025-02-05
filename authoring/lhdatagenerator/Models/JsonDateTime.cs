// -----------------------------------------------------------------------
// <copyright file="JsonDateTime.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator.Models
{
    using System;

    /// <summary>
    /// Class JsonDateTime.
    /// </summary>
    public class JsonDateTime
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="JsonDateTime"/> class.
        /// </summary>
        public JsonDateTime()
        {
            this.Date = DateTime.Now;
        }

        /// <summary>
        /// Gets or sets the date.
        /// </summary>
        /// <value>The date.</value>
        public DateTime Date { get; set; }

        /// <summary>
        /// Gets the date text.
        /// </summary>
        /// <value>The date text.</value>
        public string DateText => $"{this.Date.ToLocalTime().ToShortDateString()} - {this.Date.ToLocalTime().ToShortTimeString()}";
    }
}