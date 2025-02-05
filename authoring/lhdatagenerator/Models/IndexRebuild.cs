using System;

namespace Sitecore.Performance.LhDataGenerator.Models
{
    public class IndexRebuild
    {
        public bool Success { get; set; }

        public bool Rebuilding { get; set; }

        public bool Queued { get; set; }

        public bool Paused { get; set; }

        public string Handle { get; set; }
        public string Message { get; set; }

        public DateTime EventTime { get; set; } 
    }
}
