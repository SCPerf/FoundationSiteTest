// -----------------------------------------------------------------------
// <copyright file="General.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace Sitecore.Performance.LhDataGenerator
{
    using System;
    using System.Collections.Generic;

    using Sitecore.Configuration;
    using Sitecore.Data;
    using Sitecore.Data.Items;
    using Sitecore.SecurityModel;

    /// <summary>
    /// Class General.
    /// </summary>
    public static class General
    {
        /// <summary>
        /// The master database.
        /// </summary>
        private static Lazy<Database> availableDatabase = new Lazy<Database>(() => GetMasterDb() ?? GetWebDb());

        /// <summary>
        /// The lock object.
        /// </summary>
        private static volatile object lockObj = new object();

        /// <summary>
        /// Gets the master database.
        /// </summary>
        /// <returns>Database.</returns>
        /// <value>The master database.</value>
        public static Database GetMasterDb()
        {
            Database database;
            try
            {
                database = Factory.GetDatabase(GenerationConstants.MasterDBname);
            }
            catch (Exception)
            {
                database = null;
            }

            return database;
        }

        /// <summary>
        /// Gets the web database.
        /// </summary>
        /// <returns>Database.</returns>
        /// <value>The web database.</value>
        public static Database GetWebDb()
        {
            Database database;
            try
            {
                database = Factory.GetDatabase(GenerationConstants.WebDBname);
            }
            catch (Exception)
            {
                database = null;
            }

            return database;
        }

        /// <summary>
        /// Gets the edge database.
        /// </summary>
        /// <returns>Database.</returns>
        /// <value>The edge database.</value>
        public static Database GetEdgeDb()
        {
            Database database;
            try
            {
                database = Factory.GetDatabase(GenerationConstants.WebDBname);
            }
            catch (Exception)
            {
                database = null;
            }

            return database;
        }

        /// <summary>
        /// Gets the specified database.
        /// </summary>
        /// <param name="dbName">Name of database to retrieve.</param>
        /// <returns>Database.</returns>
        /// <value>The edge database.</value>
        public static Database GetDb(string dbName)
        {
            Database database;
            try
            {
                database = Factory.GetDatabase(dbName);
            }
            catch (Exception)
            {
                database = null;
            }

            return database;
        }

        /// <summary>
        /// Gets the available database.
        /// </summary>
        /// <returns>Database.</returns>
        public static Database GetAvailableDatabase()
        {
            return availableDatabase.Value;
        }

        /// <summary>
        /// Adds the languages.
        /// </summary>
        /// <param name="languages">The languages.</param>
        public static void AddLanguages(IEnumerable<string> languages)
        {
            var langRoot = GetMasterDb().GetItem(GenerationConstants.PathToLanguages);
            var langTemplate = GetMasterDb().Templates[GenerationConstants.LanguageTemplatePath];
            foreach (var language in languages)
            {
                using (new SecurityDisabler())
                {
                    var langExist = GetMasterDb().GetItem(GenerationConstants.PathToLanguages + "/" + language);
                    if (langExist == null)
                    {
                        langRoot.Add(language, langTemplate);
                    }
                }
            }
        }

        /// <summary>
        /// Gets the languages.
        /// </summary>
        /// <param name="useWeb">if set to <c>true</c> [use web].</param>
        /// <returns>List of languages.</returns>
        public static List<string> GetLanguages(bool useWeb = false)
        {
            var langRoot = GetAvailableDatabase().GetItem(GenerationConstants.PathToLanguages);
            var languages = new List<string>();

            foreach (Item child in langRoot.Children)
            {
                languages.Add(child.Name);
            }

            return languages;
        }
    }
}
