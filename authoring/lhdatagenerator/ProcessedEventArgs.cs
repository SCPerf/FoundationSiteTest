// -----------------------------------------------------------------------
// <copyright file="ProcessedEventArgs.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator
{
    using System;

    /// <summary>
    /// Class ProcessedEventArgs.
    /// </summary>
    public class ProcessedEventArgs : EventArgs
    {
        /// <summary>
        /// Gets or sets the name of the task.
        /// </summary>
        /// <value>The name of the task.</value>
        public string TaskName { get; set; }

        /// <summary>
        /// Gets or sets the total.
        /// </summary>
        /// <value>The total.</value>
        public int Total { get; set; }

        /// <summary>
        /// Gets or sets the processed.
        /// </summary>
        /// <value>The processed.</value>
        public int Processed { get; set; }

        /// <summary>
        /// Percentages the complete.
        /// </summary>
        /// <returns>Percent completed.</returns>
        public int PercentageComplete()
        {
            if (this.Processed < 1)
            {
                return 0;
            }

            return (this.Processed / this.Total) * 100;
        }
    }
}