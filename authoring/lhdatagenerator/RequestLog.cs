// -----------------------------------------------------------------------
// <copyright file="RequestLog.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator
{
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Text;

    /// <summary>
    /// Class TestLog.
    /// </summary>
    [DebuggerDisplay("Count = {Count}")]
    public class RequestLog : List<RequestLogItem>
    {
        /// <summary>
        /// Returns a <see cref="string" /> that represents this instance.
        /// </summary>
        /// <returns>A <see cref="string" /> that represents this instance.</returns>
        public override string ToString()
        {
            var builder = new StringBuilder();
            foreach (var logItem in this)
            {
                builder.AppendLine(logItem.ToString());
            }

            return builder.ToString();
        }
    }
}
