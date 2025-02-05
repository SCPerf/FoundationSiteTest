// -----------------------------------------------------------------------
// <copyright file="PerformanceItem.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator
{
    using System;

    using Sitecore.Data;
    using Sitecore.Data.Items;
    using Sitecore.Performance.LhDataGenerator.Models;
    using Sitecore.SecurityModel;

    /// <summary>
    /// Class PerformanceItem.
    /// </summary>
    public static class PerformanceItem
    {
        /// <summary>
        /// The processed event handler.
        /// </summary>
#pragma warning disable CS0067 // The event 'PerformanceItem.ProcessedItems' is never used
        public static event EventHandler<ProcessedEventArgs> ProcessedItems;
#pragma warning restore CS0067 // The event 'PerformanceItem.ProcessedItems' is never used

        /// <summary>
        /// Creates the article tree items.
        /// </summary>
        /// <param name="settings">The settings.</param>
        /// <returns>Boolean.</returns>
        /// <exception cref="Exception">
        /// Home page does not exist at {homePath}
        /// or
        /// Articles page does not exist at {articlesPath}.
        /// </exception>
        public static bool CreateArticleTreeItems(ArticleInformation settings)
        {
            var homePath = "/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home";
            var articlesPath = "/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home/articles";
            var articleTemplateName = "Project/Demo Shared SXA Sites/SitecoreDemo/Pages/Article Page";

            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();

                var homeItem = master.GetItem(homePath);

                if (homeItem == null)
                {
                    throw new Exception($"Home page does not exist at {homePath}");
                }

                var articlesItem = master.GetItem(articlesPath);
                if (articlesItem == null)
                {
                    throw new Exception($"Articles page does not exist at {articlesPath}");
                }

                var topTitle = $"Top_{settings.PagePrefix}";
                var topLevelItem = articlesItem.CopyTo(homeItem, topTitle, new ID(), false);
                topLevelItem.Editing.BeginEdit();
                topLevelItem["title"] = topTitle;
                topLevelItem.Appearance.DisplayName = topTitle;
                topLevelItem.Appearance.Sortorder = settings.SortOrder;
                topLevelItem.Fields["NavigationTitle"].Value = topTitle;
                topLevelItem.Editing.EndEdit();

                // Get Article Page Template
                var articleTemplate = master.GetTemplate(articleTemplateName);
                if (articleTemplate == null)
                {
                    return false;
                }

                CreateItems(topLevelItem, articleTemplate, settings.PagePrefix, settings.Depth, settings.NumItems);
            }

            return true;
        }

        /// <summary>
        /// Creates the article tree items.
        /// </summary>
        /// <param name="settings">The settings.</param>
        /// <returns>Boolean.</returns>
        /// <exception cref="Exception">
        /// Home page does not exist at {homePath}
        /// or
        /// Articles page does not exist at {articlesPath}.
        /// </exception>
        public static bool CreateFolderTreeItems(FolderItemInformation settings)
        {
            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();
                var parentItem = master.GetItem(settings.ParentPath);

                if (parentItem == null)
                {
                    throw new Exception($"Parent Path does not exist at {settings.ParentPath}");
                }
                else
                {
                    // Get Folder Template
                    var folderTemplate = master.GetTemplate("Common/Folder");
                    if (folderTemplate == null)
                    {
                        throw new Exception("Folder template does not exist.");
                    }

                    var topLevelItem = parentItem.Add($"{settings.PagePrefix}Folder", folderTemplate);

                    // Get Item Template
                    var itemTemplate = master.GetTemplate(settings.TemplateName);
                    if (itemTemplate == null)
                    {
                        throw new Exception($"Template does not exist at {settings.TemplateName}");
                    }

                    CreateItems(topLevelItem, itemTemplate, settings.PagePrefix, settings.Depth, settings.NumItems);
                }
            }

            return true;
        }

        /// <summary>
        /// Creates the items.
        /// </summary>
        /// <param name="parent">The parent.</param>
        /// <param name="template">The template.</param>
        /// <param name="pagePrefix">The page prefix.</param>
        /// <param name="depth">The depth.</param>
        /// <param name="numItems">The number items.</param>
        /// <returns>Boolean.</returns>
        private static bool CreateItems(Item parent, TemplateItem template, string pagePrefix, int depth, int numItems)
        {
            if (depth <= 0)
            {
                return true;
            }

            for (int i = 1; i <= numItems; i++)
            {
                var title = $"{pagePrefix}_{i}";
                var newItem = parent.Add(title, template);
                CreateItems(newItem, template, title, depth - 1, numItems);
            }

            return true;
        }
    }
}