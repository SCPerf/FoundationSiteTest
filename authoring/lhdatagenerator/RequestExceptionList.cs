// -----------------------------------------------------------------------
// <copyright file="RequestExceptionList.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator
{
    using System;
    using System.Collections.Generic;

    /// <summary>
    /// Class RequestExceptionList.
    /// </summary>
    public class RequestExceptionList : List<RequestException>
    {
        /// <summary>
        /// Adds the specified ex.
        /// </summary>
        /// <param name="ex">The exception to add.</param>
        public void Add(Exception ex)
        {
            var exception = new RequestException(ex);
            this.Add(exception);
        }
    }
}
