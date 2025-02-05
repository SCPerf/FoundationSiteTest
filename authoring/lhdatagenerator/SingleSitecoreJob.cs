// -----------------------------------------------------------------------
// <copyright file="SingleSitecoreJob.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator
{
    using System;
    using System.Diagnostics;

    using Sitecore.Abstractions;
    using Sitecore.Jobs;
    using Sitecore.Performance.LhDataGenerator.Models;

    /// <summary>
    /// Class SingleSitecoreJob.
    /// </summary>
    public class SingleSitecoreJob
    {
        /// <summary>
        /// The Timer.
        /// </summary>
        private static readonly Stopwatch Timer = new Stopwatch();

        /// <summary>
        /// The job started.
        /// </summary>
        private static DateTime jobStarted;

        /// <summary>
        /// The synchronize BLK.
        /// </summary>
        private static volatile object syncBlk = new object();

        /// <summary>
        /// The job name.
        /// </summary>
        private string jobName = "PerformanceGeneration";

        /// <summary>
        /// Gets the job.
        /// </summary>
        /// <value>The job.</value>
        public BaseJob Job => JobManager.GetJob(this.jobName);

        /// <summary>
        /// Jobs the status.
        /// </summary>
        /// <returns>Job Information.</returns>
        public JobInformation JobStatus()
        {
            var status = new JobInformation();

            if (this.Job == null)
            {
                status.Name = this.jobName;
                return status;
            }

            status.Name = this.jobName;
            status.Processed = this.Job.Status.Processed;
            status.Total = this.Job.Status.Total;
            status.Messages = this.Job.Status.Messages;
            status.JobRunning = !this.Job.IsDone;
            status.JobSubmitted = new JsonDateTime() { Date = jobStarted };
            status.State = this.Job.Status.State.ToString();
            status.ExecutionTime = Timer.Elapsed.TotalSeconds;
            status.PercentComplete = (long)(status.Processed / (double)status.Total * 100);
            return status;
        }

        /// <summary>
        /// Starts the create article tree job.
        /// </summary>
        /// <param name="settings">The settings.</param>
        /// <returns>Job Information.</returns>
        public JobInformation StartCreateArticleTreeJob(ArticleInformation settings)
        {
            return this.StartJob(this, "CreateArticleTree", new object[] { settings });
        }

        /// <summary>
        /// Calculates the total items that will be created for CreateArticleTree generation.
        /// </summary>
        /// <param name="settings">The settings.</param>
        /// <returns>Total number of items that will be created.</returns>
        private double CalculateTotalItems(ArticleInformation settings)
        {
            double total = 0;
            for (int i = 1; i <= settings.Depth; i++)
            {
                total += Math.Pow(settings.NumItems, settings.Depth);
            }

            return total;
        }

        /// <summary>
        /// Creates the article tree.
        /// </summary>
        /// <param name="settings">The settings.</param>
        private void CreateArticleTree(ArticleInformation settings)
        {
            try
            {
                var timer = new Stopwatch();
                this.Job.Status.Total = Convert.ToInt64(this.CalculateTotalItems(settings));
                PerformanceItem.ProcessedItems += this.PerformanceItemProcessedItems;
                PerformanceItem.CreateArticleTreeItems(settings);
            }
            catch (Exception ex)
            {
                this.Job.Status.LogException(ex);
            }
            finally
            {
                PerformanceItem.ProcessedItems -= this.PerformanceItemProcessedItems;
            }
        }

        /// <summary>
        /// Handles the ProcessedItems event of the PerformanceItem control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">ContentItemCreatedEventArgsreatedEventArgs"/> instance containing the event data.</param>
        private void PerformanceItemProcessedItems(object sender, ProcessedEventArgs e)
        {
            this.Job.Status.Processed = e.Processed;
        }

        /// <summary>
        /// Starts the job.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="methodName">Name of the method.</param>
        /// <param name="parameters">The parameters.</param>
        /// <param name="total">The total.</param>
        /// <returns>JobInformation.</returns>
        private JobInformation StartJob(object obj, string methodName, object[] parameters, int total = 0)
        {
            var status = new JobInformation();

            if (this.Job == null || this.Job.IsDone)
            {
                lock (syncBlk)
                {
                    if (this.Job == null || this.Job.IsDone)
                    {
                        var options = new DefaultJobOptions(
                            this.jobName,
                            "Performance",
                            Context.Site.Name,
                            obj,
                            methodName,
                            parameters);
                        JobManager.Start(options);

                        jobStarted = DateTime.Now.ToUniversalTime();
                        Timer.Start();
                        if (this.Job != null)
                        {
                            this.Job.Finished += this.JobFinished;
                        }

                        status.Name = this.jobName;
                        status.Processed = 0;
                        status.Total = total;
                        status.JobRunning = false;
                        status.JobSubmitted = new JsonDateTime() { Date = jobStarted };
                        status.State = "Queued";
                        status.ExecutionTime = 0;
                        return status;
                    }
                }
            }

            return this.JobStatus();
        }

        /// <summary>
        /// Jobs the finished.
        /// </summary>
        /// <param name="sender">The sender.</param>
        /// <param name="e">The <see cref="JobFinishedEventArgs"/> instance containing the event data.</param>
        private void JobFinished(object sender, JobFinishedEventArgs e)
        {
            Timer.Stop();
            jobStarted = DateTime.MinValue;
        }
    }
}