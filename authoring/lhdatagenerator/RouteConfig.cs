// -----------------------------------------------------------------------
// <copyright file="RouteConfig.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator
{
    using System.Web.Mvc;
    using System.Web.Routing;

    /// <summary>
    /// Class RouteConfig.
    /// </summary>
    public class RouteConfig
    {
        /// <summary>
        /// The register routes.
        /// </summary>
        /// <param name="routes">
        /// The routes.
        /// </param>
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.MapRoute(
             name: "PerformanceDataGenerationVersion",
             url: "performance/frameworkversion",
             defaults: new { controller = "Deployment", action = "frameworkversion" },
             namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "SitecoreVersion",
                url: "performance/version",
                defaults: new { controller = "Deployment", action = "version" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
               name: "Search",
               url: "performance/search",
               defaults: new { controller = "Search", action = "ItemSearch" },
               namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });
            
            routes.MapRoute(
               name: "Rebuild",
               url: "performance/search/rebuild",
               defaults: new { controller = "Search", action = "IndexRebuild" },
               namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
               name: "RebuildStatus",
               url: "performance/search/rebuild/status",
               defaults: new { controller = "Search", action = "IndexRebuildStatus" },
               namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
               name: "ListIndexes",
               url: "performance/search/indexes",
               defaults: new { controller = "Search", action = "ListIndexes" },
               namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });


            routes.MapRoute(
                name: "AddCategory",
                url: "performance/addcategory",
                defaults: new { controller = "ContentItemGeneration", action = "addcategory" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "GetItem",
                url: "performance/getitem",
                defaults: new { controller = "ContentItemGeneration", action = "getitem" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "AddItem",
                url: "performance/additem",
                defaults: new { controller = "ContentItemGeneration", action = "additem" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "AddCustomItem",
                url: "performance/addcustomitem",
                defaults: new { controller = "ContentItemGeneration", action = "addcustomitem" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "DelItem",
                url: "performance/delitem",
                defaults: new { controller = "ContentItemGeneration", action = "delitem" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "UpdateItem",
                url: "performance/updateitem",
                defaults: new { controller = "ContentItemGeneration", action = "updateitem" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "AddArticle",
                url: "performance/addarticle",
                defaults: new { controller = "ContentItemGeneration", action = "addarticle" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "AddArticleAsJob",
                url: "performance/addarticleasjob",
                defaults: new { controller = "ContentItemGeneration", action = "addarticleasjob" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "DelArticle",
                url: "performance/delarticle",
                defaults: new { controller = "ContentItemGeneration", action = "delarticle" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "AddFolderOfItems",
                url: "performance/addfolderofitems",
                defaults: new { controller = "ContentItemGeneration", action = "addfolderofitems" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "PublishSmart",
                url: "performance/publishsmart",
                defaults: new { controller = "Publish", action = "publishsmart" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "PublishItem",
                url: "performance/publishitem",
                defaults: new { controller = "Publish", action = "publishitem" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "PublishEdgeItem",
                url: "performance/publishedgeitem",
                defaults: new { controller = "Publish", action = "publishedgeitem" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "PublishResult",
                url: "performance/publishresult",
                defaults: new { controller = "Publish", action = "publishresult" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
                name: "Test",
                url: "performance/test",
                defaults: new { controller = "ContentItemGeneration", action = "test" },
                namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
              name: "PerformanceDataGeneration",
              url: "performance/data/{action}/{id}",
              defaults: new { controller = "ContentItemGeneration", id = UrlParameter.Optional, action = "index" },
              namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
              name: "PerformanceTests",
              url: "performance/test/{action}/{id}",
              defaults: new { controller = "Test", id = UrlParameter.Optional, action = "index" },
              namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });

            routes.MapRoute(
              name: "PerformanceGeneral",
              url: "performance/{controller}/{action}/{id}",
              defaults: new { controller = "Deployment", id = UrlParameter.Optional, action = "index" },
              namespaces: new[] { "Sitecore.Performance.LhDataGenerator" });
        }
    }
}
