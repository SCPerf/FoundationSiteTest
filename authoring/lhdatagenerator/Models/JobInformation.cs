// -----------------------------------------------------------------------
// <copyright file="JobInformation.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator.Models
{
    using System.Collections.Generic;
    using System.Collections.Specialized;

    /// <summary>
    /// Class JobStatus.
    /// </summary>
    public class JobInformation
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="JobInformation"/> class.
        /// </summary>
        public JobInformation()
        {
            this.Messages = new StringCollection();
            this.Exceptions = new List<ExceptionWrapper>();
        }

        /// <summary>
        /// Gets or sets the name.
        /// </summary>
        /// <value>The name.</value>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the total.
        /// </summary>
        /// <value>The total.</value>
        public long Total { get; set; }

        /// <summary>
        /// Gets or sets the processed.
        /// </summary>
        /// <value>The processed.</value>
        public long Processed { get; set; }

        /// <summary>
        /// Gets or sets the percent complete.
        /// </summary>
        /// <value>The percent complete.</value>
        public long PercentComplete { get; set; }

        /// <summary>
        /// Gets or sets the messages.
        /// </summary>
        /// <value>The messages.</value>
        public StringCollection Messages { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether [job initialized].
        /// </summary>
        /// <value><c>true</c> if [job initialized]; otherwise, <c>false</c>.</value>
        public bool JobRunning { get; set; }

        /// <summary>
        /// Gets or sets the start.
        /// </summary>
        /// <value>The start.</value>
        public JsonDateTime JobSubmitted { get; set; }

        /// <summary>
        /// Gets or sets the state.
        /// </summary>
        /// <value>The state.</value>
        public string State { get; set; }

        /// <summary>
        /// Gets or sets the execution time.
        /// </summary>
        /// <value>The execution time.</value>
        public double ExecutionTime { get; set; }

        /// <summary>
        /// Gets the exceptions.
        /// </summary>
        /// <value>The exceptions.</value>
        public List<ExceptionWrapper> Exceptions { get; private set; }
    }
}