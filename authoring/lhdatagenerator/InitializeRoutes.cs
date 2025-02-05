// -----------------------------------------------------------------------
// <copyright file="InitializeRoutes.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator
{
    using System.Web.Routing;

    using Sitecore.Pipelines;

    /// <summary>
    /// Class InitializeRoutes.
    /// </summary>
    public class InitializeRoutes
    {
        /// <summary>
        /// The process.
        /// </summary>
        /// <param name="args">
        /// The args.
        /// </param>
        public void Process(PipelineArgs args)
        {
            if (!Context.IsUnitTesting)
            {
                RouteConfig.RegisterRoutes(RouteTable.Routes);
            }
        }
    }
}