
namespace Sitecore.Performance.LhDataGenerator.Models
{
    using System.Collections.Generic;

    /// <summary>
    /// Models search result set
    /// </summary>
    public class SearchResults
    {
        /// <summary>
        /// List of items returned from items. 
        /// </summary>
        private readonly List<SearchItem> items = new List<SearchItem>();

        /// <summary>
        /// Default Constructor
        /// </summary>
        public SearchResults() {}

        /// <summary>
        /// Copy Constructor
        /// </summary>
        /// <param name="results">The</param>
        public SearchResults(SearchResults results)
        {
            foreach (var item in items)
            {
                var newItem = new SearchItem
                {
                    Id = item.Id,
                    Name = item.Name,
                    DisplayName = item.DisplayName,
                };

                items.Add(newItem);
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="results"></param>
        internal SearchResults(IEnumerable<SearchItem> results)
        {
            items = (List<SearchItem>)results;
        }

        /// <summary>
        /// Provides access to search results
        /// </summary>
        public IEnumerable<SearchItem> Results { get { return items; } }

        /// <summary>
        /// Message associated with search results
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// The index name associated with the search results.
        /// </summary>
        public string IndexName { get; set; }

        /// <summary>
        /// The search test associated with the search results.
        /// </summary>
        public string SearchText { get; set; }
    }
}
