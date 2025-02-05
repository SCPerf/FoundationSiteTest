// -----------------------------------------------------------------------
// <copyright file="RequestLogItem.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator
{
    using System;

    /// <summary>
    /// Class RequestLogItem.
    /// </summary>
    public class RequestLogItem
    {
        /// <summary>
        /// The internal date field
        /// </summary>
        private DateTime internalDate = default(DateTime);

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestLogItem"/> class.
        /// </summary>
        public RequestLogItem()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestLogItem"/> class.
        /// </summary>
        /// <param name="logItem">The log item.</param>
        public RequestLogItem(RequestLogItem logItem)
        {
            this.Date = new DateTime(logItem.Date.Ticks);
            this.Duration = logItem.Duration;
            this.Message = logItem.Message;
            this.Type = logItem.Type;
        }

        /// <summary>
        /// Gets or sets the message.
        /// </summary>
        /// <value>The message.</value>
        public string Message { get; set; }

        /// <summary>
        /// Gets or sets the type.
        /// </summary>
        /// <value>The type.</value>
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets the date in UTC.
        /// </summary>
        /// <value>The date.</value>
        public DateTime Date
        {
            get
            {
                return DateTime.SpecifyKind(this.internalDate, DateTimeKind.Utc);
            }

            set
            {
                this.internalDate = value;
            }
        }

        /// <summary>
        /// Gets or sets the duration.
        /// </summary>
        /// <value>The duration.</value>
        public int Duration { get; set; }

        /// <summary>
        /// Gets the log entry.
        /// </summary>
        /// <value>The log entry.</value>
        public string FormattedLogEntry
        {
            get
            {
                return string.Format(
                "[{0}] - {1}|{2}|{3} - {4}",
                this.Type.ToUpper(),
                this.Date.ToLocalTime().ToShortDateString(),
                this.Date.ToLocalTime().ToShortTimeString(),
                this.Duration,
                this.Message);
            }
        }

        /// <summary>
        /// Sets the type of the Request.
        /// </summary>
        /// <param name="type">The type.</param>
        /// <returns>The type as a string.</returns>
        public string SetRequestType(RequestLogTypes type)
        {
            this.Type = type.ToString();
            return this.Type;
        }

        /// <summary>
        /// To the string.
        /// </summary>
        /// <returns>Formatted Log string.</returns>
        public override string ToString()
        {
            return this.FormattedLogEntry;
        }
    }
}
