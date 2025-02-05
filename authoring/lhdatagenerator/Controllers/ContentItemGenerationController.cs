// -----------------------------------------------------------------------
// <copyright file="ContentItemGenerationController.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator.Controllers
{
    using System;
    using System.Collections.ObjectModel;
    using System.Web.Mvc;

    using Sitecore.Data;
    using Sitecore.Data.Items;
    using Sitecore.Performance.LhDataGenerator.Models;
    using Sitecore.SecurityModel;

    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.Dynamic;
    using Sitecore.Extensions;

    public class FieldModel
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }

    public class RootModel
    {
        public List<FieldModel> Fields { get; set; }
    }

    /// <summary>
    /// Class ContentItems.
    /// </summary>
    public class ContentItemGenerationController : Controller
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ContentItemGenerationController"/> class.
        /// </summary>
        public ContentItemGenerationController()
        {
        }

        /// <summary>
        /// Tests this instance.
        /// </summary>
        /// <returns>Something.</returns>
        /// <exception cref="Exception">Articles page does not exist at {articlesPath}.</exception>
        public ActionResult Test()
        {
            var articlesPath = "/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home/articles";
            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();

                var articlesItem = master.GetItem(articlesPath);
                if (articlesItem == null)
                {
                    throw new Exception($"Articles page does not exist at {articlesPath}");
                }

                articlesItem.Fields.ReadAll();
                Collection<string> fields = new Collection<string>();
                for (int i = 0; i < articlesItem.Fields.Count; i++)
                {
                    fields.Add(articlesItem.Fields[i].Name);
                }

                return this.Json(fields, JsonRequestBehavior.AllowGet);
            }

            /*
            var topLevelPageTemplate = master.GetTemplate(topLevelPageTemplateName);
            if (topLevelPageTemplate == null)
            {
                throw new Exception($"Template does not exist at {topLevelPageTemplateName}");
            }

            var topTitle = $"Top_{pagePrefix}";
            var topLevelItem = homeItem.Add(topTitle, topLevelPageTemplate);

            var topLevelItemName = "TopPerformance";
            var topLevelItemPath = "/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home/TopPerformance";

            Get parent item where all the other items will be created under
            var topLevelItem = master.GetItem(topLevelItemPath);

            if (topLevelItem == null)
            {
                throw new Exception($"Top-level page \"{topLevelItemName}\" does not exist at {topLevelItemPath}");
            }
            */
        }

        /// <summary>
        /// Adds the category.
        /// </summary>
        /// <param name="name">The name.</param>
        /// <param name="sortOrder">The sort order.</param>
        /// <param name="parentPath">The parent path.</param>
        /// <param name="categorySourcePath">The category source path.</param>
        /// <returns>
        /// Full path of created item.
        /// </returns>
        /// <exception cref="Exception">Home page does not exist at {homePath}
        /// or
        /// Articles page does not exist at {articlesPath}.</exception>
        public ActionResult AddCategory(string name, int sortOrder = 1, string parentPath = "/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home", string categorySourcePath = "/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home/articles")
        {
            var result = new RequestResult();
            result.LogInfo("AddCategory: Start");

            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();

                var homeItem = master.GetItem(parentPath);

                if (homeItem == null)
                {
                    throw new Exception($"Home page does not exist at {parentPath}");
                }

                var articlesItem = master.GetItem(categorySourcePath);
                if (articlesItem == null)
                {
                    throw new Exception($"Articles page does not exist at {categorySourcePath}");
                }

                var topTitle = name;
                var topLevelItem = articlesItem.CopyTo(homeItem, topTitle, new ID(), false);
                topLevelItem.Editing.BeginEdit();
                topLevelItem["title"] = topTitle;
                topLevelItem.Appearance.DisplayName = topTitle;
                topLevelItem.Appearance.Sortorder = sortOrder;
                topLevelItem.Fields["NavigationTitle"].Value = topTitle;
                topLevelItem.Editing.EndEdit();
            }

            result.Success = true;
            result.LogInfo($"Path: {parentPath}/{name}");
            result.LogInfo("AddCategory: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Gets the item.
        /// </summary>
        /// <param name="itemPath">The parent path.</param>
        /// <returns>
        /// Full path of item.
        /// </returns>
        /// <exception cref="Exception">Item does not exist at {parentPath}.</exception>
        public ActionResult GetItem(string itemPath)
        {
            var result = new RequestResult();
            result.LogInfo("GetItem: Start");

            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();
                var parentItem = master.GetItem(itemPath);

                if (parentItem == null)
                {
                    result.Exceptions.Add(new Exception($"Item does not exist at {itemPath}"));
                    result.Success = false;
                }
                else
                {
                    result.Success = true;
                }
            }

            result.LogInfo($"Path: {itemPath}");
            result.LogInfo("GetItem: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Adds the item.
        /// </summary>
        /// <param name="name">The name.</param>
        /// <param name="parentPath">The parent path.</param>
        /// <param name="templateName">Name of the template.</param>
        /// <returns>
        /// Full path of created item.
        /// </returns>
        /// <exception cref="Exception">Item does not exist at {parentPath}.</exception>
        public ActionResult AddItem(string name, string parentPath, string templateName = "Project/Demo Shared SXA Sites/SitecoreDemo/Pages/Article Page")
        {
            var result = new RequestResult();
            result.LogInfo("AddItem: Start");

            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();
                var parentItem = master.GetItem(parentPath);

                if (parentItem == null)
                {
                    result.Exceptions.Add(new Exception($"Item does not exist at {parentPath}"));
                    result.Success = false;
                }
                else
                {
                    // Get Article Page Template
                    var articleTemplate = master.GetTemplate(templateName);
                    if (articleTemplate == null)
                    {
                        this.Json(false, JsonRequestBehavior.AllowGet);
                    }

                    var newItem = parentItem.Add(name, articleTemplate);
                    result.Success = true;
                }
            }

            result.LogInfo($"Path: {parentPath}/{name}");
            result.LogInfo("AddItem: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Deletes the item.
        /// </summary>
        /// <param name="itemPath">The item path.</param>
        /// <returns>Bool for success.</returns>
        /// <exception cref="Exception">Item does not exist at {itemPath}.</exception>
        public ActionResult DelItem(string itemPath)
        {
            var result = new RequestResult();
            result.LogInfo("DelItem: Start");

            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();

                var item = master.GetItem(itemPath);

                if (item == null)
                {
                    throw new Exception($"Item does not exist at {itemPath}");
                }

                item.Delete();

                result.Success = true;
                result.LogInfo("DelItem: End");
                return this.Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Updates the title and display name of an existing item with current time.
        /// </summary>
        /// <param name="itemPath">The parent path.</param>
        /// <returns>
        /// Full path of item.
        /// </returns>
        /// <exception cref="Exception">Item does not exist at {parentPath}.</exception>
        public ActionResult UpdateItem(string itemPath)
        {
            var result = new RequestResult();
            result.LogInfo("GetItem: Start");

            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();
                var parentItem = master.GetItem(itemPath);

                if (parentItem == null)
                {
                    result.Exceptions.Add(new Exception($"Item does not exist at {itemPath}"));
                    result.Success = false;
                }
                else
                {
                    var nowString = DateTime.Now.ToShortTimeString();
                    var nameString = parentItem.Name;
                    parentItem.Editing.BeginEdit();
                    parentItem["title"] = nameString + " - " + nowString;
                    parentItem.Appearance.DisplayName = nameString + " - " + nowString;
                    parentItem.Editing.EndEdit();
                    result.Success = true;
                }
            }

            result.LogInfo($"Path: {itemPath}");
            result.LogInfo("GetItem: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
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
        public bool CreateItems(Item parent, TemplateItem template, string pagePrefix, int depth, int numItems)
        {
            if (depth <= 0)
            {
                return true;
            }

            for (int i = 1; i <= numItems; i++)
            {
                var title = $"{pagePrefix}_{i}";
                var newItem = parent.Add(title, template);
                this.CreateItems(newItem, template, title, depth - 1, numItems);
            }

            return true;
        }

        /// <summary>
        /// Adds the article obsolete.
        /// </summary>
        /// <param name="pagePrefix">The page prefix.</param>
        /// <param name="numItems">The number items.</param>
        /// <param name="depth">The depth.</param>
        /// <param name="sortOrder">The sort order.</param>
        /// <returns>Result of action.</returns>
        /// <exception cref="Exception">
        /// Home page does not exist at {homePath}
        /// or
        /// Articles page does not exist at {articlesPath}.
        /// </exception>
        public ActionResult AddArticle(string pagePrefix, int numItems, int depth = 1, int sortOrder = 1)
        {
            var result = new RequestResult();
            result.LogInfo("AddArticle: Start");

            try
            {
                var settings = new ArticleInformation(pagePrefix, numItems, depth, sortOrder);
                var success = PerformanceItem.CreateArticleTreeItems(settings);
                result.Success = success;
            }
            catch (Exception ex)
            {
                result.Exceptions.Add(new RequestException(ex));
                result.Success = false;
            }

            result.LogInfo("AddArticle: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Adds the article.
        /// </summary>
        /// <param name="pagePrefix">The page prefix.</param>
        /// <param name="numItems">The number items.</param>
        /// <param name="depth">The depth.</param>
        /// <param name="sortOrder">The sort order.</param>
        /// <returns>Result of action.</returns>
        public ActionResult AddArticleAsJob(string pagePrefix, int numItems, int depth = 1, int sortOrder = 1)
        {
            var result = new RequestResult();
            result.LogInfo("AddArticleAsJob: Start");

            try
            {
                var success = new JobInformation();
                var settings = new ArticleInformation(pagePrefix, numItems, depth, sortOrder);
                var job = new SingleSitecoreJob();
                success = job.StartCreateArticleTreeJob(settings);
                result.Success = true;
            }
            catch (Exception ex)
            {
                result.Exceptions.Add(new RequestException(ex));
                result.Success = false;
            }

            result.LogInfo("AddArticle: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Deletes the article.
        /// </summary>
        /// <param name="pagePrefix">The page prefix.</param>
        /// <returns>Result of action.</returns>
        /// <exception cref="Exception">Home page does not exist at {itemPath}.</exception>
        public ActionResult DelArticle(string pagePrefix)
        {
            var result = new RequestResult();
            result.LogInfo("DelArticle: Start");

            using (new SecurityDisabler())
            {
                var master = General.GetMasterDb();

                var itemPath = $"/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home/Top_{pagePrefix}";
                var item = master.GetItem(itemPath);

                if (item == null)
                {
                    result.Exceptions.Add(new Exception($"Article does not exist at {itemPath}"));
                    result.Success = false;
                }
                else
                {
                    item.Delete();
                    result.Success = true;
                }

                result.LogInfo("DelArticle: End");
                return this.Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Adds the article obsolete.
        /// </summary>
        /// <param name="parentPath">The path of the parent folder.</param>
        /// <param name="templateName">The template used to create items.</param>
        /// <param name="pagePrefix">The page prefix.</param>
        /// <param name="numItems">The number items.</param>
        /// <param name="depth">The depth.</param>
        /// <param name="sortOrder">The sort order.</param>
        /// <returns>Result of action.</returns>
        /// <exception cref="Exception">
        /// Home page does not exist at {homePath}
        /// or
        /// Articles page does not exist at {articlesPath}.
        /// </exception>
        public ActionResult AddFolderOfItems(string parentPath, string templateName, string pagePrefix, int numItems, int depth = 1, int sortOrder = 1)
        {
            var result = new RequestResult();
            result.LogInfo("AddFolderOfItems: Start");

            try
            {
                var settings = new FolderItemInformation(parentPath, templateName, pagePrefix, numItems, depth, sortOrder);
                var success = PerformanceItem.CreateFolderTreeItems(settings);
                result.Success = success;
            }
            catch (Exception ex)
            {
                result.Exceptions.Add(new RequestException(ex));
                result.Success = false;
            }

            result.LogInfo("AddFolderOfItems: End");
            return this.Json(result, JsonRequestBehavior.AllowGet);
        }
    }
}
