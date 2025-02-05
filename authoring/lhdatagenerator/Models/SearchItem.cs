using System;

namespace Sitecore.Performance.LhDataGenerator.Models
{
    public class SearchItem
    {
        public SearchItem() {
            Id = Guid.Empty;
            Name = string.Empty;
            DisplayName = string.Empty;
        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
    }
}
