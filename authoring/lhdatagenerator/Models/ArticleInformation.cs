// -----------------------------------------------------------------------
// <copyright file="ArticleInformation.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator.Models
{
    /// <summary>
    /// Article Information Settings.
    /// </summary>
    public class ArticleInformation
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ArticleInformation"/> class.
        /// </summary>
        /// <param name="pagePrefix">The page prefix.</param>
        /// <param name="numItems">The number items.</param>
        /// <param name="depth">The depth.</param>
        /// <param name="sortOrder">The sort order.</param>
        public ArticleInformation(string pagePrefix, int numItems, int depth = 1, int sortOrder = 1)
        {
            this.PagePrefix = pagePrefix;
            this.NumItems = numItems;
            this.Depth = depth;
            this.SortOrder = sortOrder;
        }

        /// <summary>
        /// Gets or sets the page prefix.
        /// </summary>
        /// <value>
        /// The page prefix.
        /// </value>
        public string PagePrefix { get; set; }

        /// <summary>
        /// Gets or sets the number items.
        /// </summary>
        /// <value>
        /// The number items.
        /// </value>
        public int NumItems { get; set; }

        /// <summary>
        /// Gets or sets the depth.
        /// </summary>
        /// <value>
        /// The depth.
        /// </value>
        public int Depth { get; set; }

        /// <summary>
        /// Gets or sets the sort order.
        /// </summary>
        /// <value>
        /// The sort order.
        /// </value>
        public int SortOrder { get; set; }
    }
}