namespace Sitecore.Performance.LhDataGenerator.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web.Mvc;

    using Sitecore.ContentSearch;
    using Sitecore.ContentSearch.Linq;
    using Sitecore.ContentSearch.Maintenance;
    using Sitecore.ContentSearch.Utilities;
    using Sitecore.ContentSearch.SearchTypes;
    using Sitecore.Data.Items;
    using Sitecore.Performance.LhDataGenerator.Models;
    using Sitecore.ContentSearch.Extracters.IFilterTextExtraction;

    public class SearchController : Controller
    {
        public SearchController() { }

        public ActionResult IndexRebuild(string indexName = "sitecore_master_index")
        {
            var result = new IndexRebuild();
            if (string.IsNullOrEmpty(indexName))
            {
                result.Message = "Index Name was not specified";
                result.Success = false;
                return this.Json(result, JsonRequestBehavior.AllowGet);
            }

            var index = ContentSearchManager.GetIndex(indexName);
            var job = IndexCustodian.FullRebuild(index, true);
            result = new IndexRebuild()
            {
                Message = "Indexing Job Submitted",
                Handle = job.Handle.ToString(),
                EventTime = DateTime.UtcNow,
                Success = true,
                Rebuilding = true,
            };

            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult IndexRebuildStatus(string handleString, string indexName = "sitecore_master_index")
        {
            var result = new IndexRebuild();

            if (string.IsNullOrEmpty(handleString))
            {
                result.Message = "Job handle was not specified";
                result.EventTime = DateTime.UtcNow;
                result.Success = false; 
                return this.Json(result, JsonRequestBehavior.AllowGet);

            }

            if (string.IsNullOrEmpty(indexName))
            {
                result.Message = "Index Name was not specified";
                result.EventTime = DateTime.UtcNow;
                result.Success = false;
                return this.Json(result, JsonRequestBehavior.AllowGet);
            }

            Handle handle = Handle.Parse(handleString);

            if (handle == null)
            {
                result.Message = "Handle specified could not be identified as a Job.";
                return this.Json(result, JsonRequestBehavior.AllowGet);
            }

            var index = ContentSearchManager.GetIndex(indexName);
            var rebuilding = IndexCustodian.IsRebuilding(index);
            var queued = IndexCustodian.IsQueued(index);
            var paused = IndexCustodian.IsIndexingPaused(index);

            result.Success = true;
            result.Handle = handleString;
            result.EventTime = DateTime.UtcNow;
            result.Rebuilding = rebuilding;
            result.Queued = queued;
            result.Paused = paused;

            if (result.Rebuilding)
            {
                result.Message = "Rebuild InProgress";
            } else
            {
                result.Message = "Rebuild Complete";
            }

            return this.Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ItemSearch(string search, string indexName="sitecore_master_index")
        {
            var resultSet = new SearchResults();
            if (string.IsNullOrEmpty(search))
            {
                resultSet.Message = "search parameter not specified.";
                return this.Json(resultSet, JsonRequestBehavior.AllowGet);
            }

            List<SearchItem> items = new List<SearchItem>();
            IEnumerable<Item> results = SearchItems(search, indexName);

            foreach (var result in results)
            {
                var item = new SearchItem();
                item.Name = result.Name;
                item.DisplayName = result.DisplayName;
                item.Id = result.ID.ToGuid();
                items.Add(item);
            }

            resultSet = new SearchResults(items)
            {
               Message = "search completed",
               IndexName = indexName,
               SearchText = search
               
            };

            return this.Json(resultSet, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ListIndexes()
        {
            return this.Json(Indexes, JsonRequestBehavior.AllowGet);
        }

        public static IEnumerable<string> Indexes {
            get 
            {

                var indexes = new List<string>();
                var sitecoreIndexs = ContentSearchManager.Indexes.ToList();
                foreach (var item in sitecoreIndexs)
                {
                    indexes.Add(item.Name);
                }

                return indexes;
            }
        }


        public static IEnumerable<Item> SearchItems(string searchText, string indexName)
        {
            // Get the search index
            // TODO: Add Try Catch Here if index is not found
            var index = ContentSearchManager.GetIndex(indexName);

            // Create a search context
            using (var context = index.CreateSearchContext())
            {
                List<Item> items = new List<Item>();

                // Build a query
                var query = context.GetQueryable<SearchResultItem>()
                                   .Where(item => item.Name != null && item.Name.Contains(searchText));

                // Execute the query
                var results = query.GetResults();

                // Get the master database
                Data.Database master = Sitecore.Configuration.Factory.GetDatabase("master");

                // Retrieve the items from the results
                foreach (var result in results.Hits)
                {
                    if (result == null)
                    {
                        break;
                    }

                    if (result.Document == null)
                    {
                        break;
                    }

                    var searchItem = result.Document.GetItem();

                    if (searchItem == null)
                    {
                        break;
                    }

                    // Get the item ID from the result
                    var itemId = searchItem.ID;

                    try
                    {
                        // Get the Sitecore item using the ID
                        var item = master.GetItem(itemId);

                        if (item == null)
                        {
                            Diagnostics.Log.Info($"LHDATA Failure to get item with the item id: {itemId}", "LHDATA");
                            break;
                        }
                        else
                        {
                            items.Add(item);
                        }
                    }
                    catch
                    {
                        Diagnostics.Log.Info($"LHDATA Failure to get item - Skipping", "LHDATA");
                    }
                }

                return items;
            }
        }
    }
}
