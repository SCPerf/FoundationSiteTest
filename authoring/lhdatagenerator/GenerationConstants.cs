// -----------------------------------------------------------------------
// <copyright file="GenerationConstants.cs" company="Sitecore Corporation">
// Copyright (c) Sitecore Corporation. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
namespace Sitecore.Performance.LhDataGenerator
{
    using System;

    /// <summary>
    /// Class GenerationConstants.
    /// </summary>
    public static class GenerationConstants
    {
        /// <summary>
        /// The default item size.
        /// </summary>
        public const int DefaultItemSize = 300;

        /// <summary>
        /// The master database name.
        /// </summary>
        public static readonly string MasterDBname = "master";

        /// <summary>
        /// The web database name.
        /// </summary>
        public static readonly string WebDBname = "web";

        /// <summary>
        /// The edge database name.
        /// </summary>
        public static readonly string EdgeDBname = "edge";

        /// <summary>
        /// The path to parent.
        /// </summary>
        public static readonly string PathToParent = "/sitecore/content/Home";

        /// <summary>
        /// The path to languages.
        /// </summary>
        public static readonly string PathToLanguages = "/sitecore/system/Languages";

        /// <summary>
        /// The language template path.
        /// </summary>
        public static readonly string LanguageTemplatePath = "System/Language";

        /// <summary>
        /// The media path.
        /// </summary>
        public static readonly string MediaPath = "/sitecore/media library";

        /// <summary>
        /// The unversioned media template path.
        /// </summary>
        public static readonly string UnversionedMediaTemplatePath = "/sitecore/templates/System/Media/Unversioned";

        /// <summary>
        /// The template path.
        /// </summary>
        public static readonly string TemplatePath = "/sitecore/templates/";

        /// <summary>
        /// The template's Standard Values.
        /// </summary>
        public static readonly string TemplateStandardValues = "__Standard Values";

        /// <summary>
        /// The generated content field name.
        /// </summary>
        public static readonly string GeneratedContentFieldName = "Field";

        /// <summary>
        /// The generated single line field name.
        /// </summary>
        public static readonly string GeneratedSingleLineFieldName = "sl_";

        /// <summary>
        /// The generated rich text field name.
        /// </summary>
        public static readonly string GeneratedRichTextFieldName = "rt_";

        /// <summary>
        /// The generated number field name.
        /// </summary>
        public static readonly string GeneratedNumberFieldName = "nb_";

        /// <summary>
        /// The generated multi line field name.
        /// </summary>
        public static readonly string GeneratedMultiLineFieldName = "ml_";

        /// <summary>
        /// The generated integer field name.
        /// </summary>
        public static readonly string GeneratedIntegerFieldName = "in_";

        /// <summary>
        /// The generated date time field name.
        /// </summary>
        public static readonly string GeneratedDateTimeFieldName = "dt_";

        /// <summary>
        /// The generated date field name.
        /// </summary>
        public static readonly string GeneratedDateFieldName = "da_";

        /// <summary>
        /// The generated check field name.
        /// </summary>
        public static readonly string GeneratedCheckFieldName = "ck_";

        /// <summary>
        /// The sample workflow identifier.
        /// </summary>
        public static readonly Guid SampleWorkflowId = new Guid("A5BC37E7-ED96-4C1E-8590-A26E64DB55EA");

        /// <summary>
        /// The sample workflow approved state.
        /// </summary>
        public static readonly Guid SampleWorkflowApprovedState = new Guid("FCA998C5-0CC3-4F91-94D8-0A4E6CAECE88");

        /// <summary>
        /// The text.
        /// </summary>
        public static readonly string Text512Bytes = @"Lorem ipsum dolor sit ametc consectetur adipiscing elit. Proin et dui et enim gravida feugiat sed ac arcu. Curabitur semper fringilla tellus. Maecenas at eros vel velit consequat efficitur et quis urna. Aliquam nec ex pretium mauris feugiat laoreet id tincidunt ipsum. Sed dignissim elit vehicula diam venenatis volutpat. Sed lorem felisc iaculis quis eleifend sit ametc egestas at nisl. Mauris mattis ligula justoc sit amet facilisis elit finibus in. Nullam nec sodales justo. Aenean elementum gravida quam sed.";
    }
}
