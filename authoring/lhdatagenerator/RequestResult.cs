// -----------------------------------------------------------------------
// <copyright file="RequestResult.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator
{
    using System;
    using System.Runtime.CompilerServices;

    /// <summary>
    /// Class RequestResult.
    /// </summary>
    public class RequestResult
    {
        /// <summary>
        /// The log time.
        /// </summary>
        private DateTime logTime = DateTime.UtcNow;

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestResult"/> class.
        /// </summary>
        public RequestResult()
        {
            this.Log = new RequestLog();
            this.Exceptions = new RequestExceptionList();
            this.Success = true;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestResult"/> class.
        /// </summary>
        /// <param name="results">The results.</param>
        public RequestResult(RequestResult results)
            : this()
        {
            foreach (var logItem in results.Log)
            {
                this.Log.Add(new RequestLogItem(logItem));
            }

            foreach (var exception in results.Exceptions)
            {
                this.Exceptions.Add(new RequestException(exception));
            }

            this.Success = results.Success;
        }

        /// <summary>
        /// Gets or sets a value indicating whether this <see cref="RequestResult"/> is success.
        /// </summary>
        /// <value><c>true</c> if success; otherwise, <c>false</c>.</value>
        public bool Success { get; set; }

        /// <summary>
        /// Gets the messages.
        /// </summary>
        /// <value>The messages.</value>
        public RequestLog Log { get; private set; }

        /// <summary>
        /// Gets the exceptions.
        /// </summary>
        /// <value>The exceptions.</value>
        public RequestExceptionList Exceptions { get; private set; }

        /// <summary>
        /// Gets the log time.
        /// </summary>
        /// <value>The log time.</value>
        private TimeSpan LogTime
        {
            get
            {
                var previousTime = this.logTime;
                this.logTime = DateTime.UtcNow;
                return this.logTime.Subtract(previousTime);
            }
        }

        /// <summary>
        /// Logs the information.
        /// </summary>
        /// <param name="format">The format.</param>
        /// <param name="args">The arguments.</param>
        public void LogInfo(string format, params object[] args)
        {
            this.LogInfo(string.Format(format, args));
        }

        /// <summary>
        /// Logs the information.
        /// </summary>
        /// <param name="message">The message.</param>
        public void LogInfo(string message)
        {
            this.LogMessage(RequestLogTypes.Info.ToString(), message);
        }

        /// <summary>
        /// Logs the warn.
        /// </summary>
        /// <param name="format">The format.</param>
        /// <param name="args">The arguments.</param>
        public void LogWarn(string format, params object[] args)
        {
            this.LogInfo(string.Format(format, args));
        }

        /// <summary>
        /// Logs the warn.
        /// </summary>
        /// <param name="message">The message.</param>
        public void LogWarn(string message)
        {
            this.LogMessage(RequestLogTypes.Warn.ToString(), message);
        }

        /// <summary>
        /// Logs the fail.
        /// </summary>
        /// <param name="format">The format.</param>
        /// <param name="args">The arguments.</param>
        public void LogFail(string format, params object[] args)
        {
            this.LogInfo(string.Format(format, true, args));
        }

        /// <summary>
        /// Logs the fail.
        /// </summary>
        /// <param name="format">The format.</param>
        /// <param name="setSuccess">if set to <c>true</c> [set success].</param>
        /// <param name="args">The arguments.</param>
        public void LogFail(string format, bool setSuccess, params object[] args)
        {
            if (setSuccess)
            {
                this.Success = false;
            }

            this.LogInfo(string.Format(format, args));
        }

        /// <summary>
        /// Logs the fail.
        /// </summary>
        /// <param name="message">The message.</param>
        public void LogFail(string message)
        {
            this.LogFail(message, false);
        }

        /// <summary>
        /// Logs a fail.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <param name="sucess">When passed in this will set the success over the entire context.</param>
        public void LogFail(string message, bool sucess)
        {
            this.Success = sucess;
            this.LogMessage(this.Success.ToString(), message);
        }

        /// <summary>
        /// Logs the message.
        /// </summary>
        /// <param name="type">The type.</param>
        /// <param name="message">The message.</param>
        public void LogMessage(string type, string message)
        {
            var logItem = new RequestLogItem
            {
                Duration = Convert.ToInt32(this.LogTime.TotalMilliseconds),
                Date = DateTime.UtcNow,
                Message = message,
                Type = type,
            };

            this.Log.Add(logItem);
        }
    }
}
