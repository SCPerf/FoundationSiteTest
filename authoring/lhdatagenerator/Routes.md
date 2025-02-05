# Performance - Lighthouse Content Generation Routes

## Add Article
Creates a tree of items based on the Articles template of the Lighthouse site.  A top-level page (parent) is created from where all the other articles are created.

### Route: http://{site}/performance/addarticle
### Parameters
* pagePrefix {string} : A string used in the naming of items created.  The top-level pages are in the form of "Top_{pagePrefix}", while all descendant pages are in the form of "{pagePrefix}_{a}_{b}_{c}...{n}", where {a}...{n} correspond to the depth.

* numItems {int} : Number of items to create on the first level, as well as the number of child items to create on succeeding levels.

* depth {int} : Number of levels to create items.

### Example:
1. Single Level
https://cm.sitecoredemo.io/performance/addarticle?pagePrefix=Arc1&numItems=3&depth=1

```
Top_Arc1
|
+---Arc1_1
|
+---Arc1_2
|
+---Arc1_3
```

2. Multiple Levels
https://cm.sitecoredemo.io/performance/addarticle?pagePrefix=Arc2&numItems=3&depth=2

```
Top_Arc2
|
+---Arc2_1
|   |
|   +---Arc2_1_1
|   |
|   +---Arc2_1_2
|   |
|   +---Arc2_1_3
|
+---Arc2_2
|   |
|   +---Arc2_2_1
|   |
|   +---Arc2_2_2
|   |
|   +---Arc2_2_3
|
+---Arc2_3
    |
    +---Arc2_1_1
    |
    +---Arc2_1_2
    |
    +---Arc2_1_3
```

## Delete Article
Deletes a tree of articles that were created using the *Add Article* route.

### Route: http://{site}/performance/delarticle

### Parameters
* pagePrefix {string} : String used to generate the articles.

### Example:
https://cm.sitecoredemo.io/performance/delarticle?pagePrefix=Arc1

## Add Article As Job
Same as *Add Article* above, however, the work is submitted as a *Sitecore Job*.

To view the running jobs, navigate to:
https://cm.sitecoredemo.io/sitecore/admin/jobs.aspx

### Example:
https://cm.sitecoredemo.io/performance/addarticleasjob?pagePrefix=Arc&numItems=10&depth=3

## Add Category
Creates a new item based on an existing item as a source.  This is designed by default to create a Top-Level page based on the Lighthouse Articles page.

### Route: http://{site}/performance/addcategory
### Parameters
* name {string} : Name of the new item.

* sortOrder {int} : Top-Level display sort order.  Set to "1" by default.

* parentPath {string} : The path of the parent from where the new category item will be created.  By default, this is set to "/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home".

* categorySourcePath {string} : The path of the source item from which the new category item will be created with.  By default, this is set to "/sitecore/content/Demo SXA Sites/LighthouseLifestyle/home/articles".

### Example:
https://cm.sitecoredemo.io/performance/addcategory?name=Cat1

## Add Item
Creates a new item based on a template.

### Route: http://{site}/performance/additem
### Parameters
* name {string} : Name of the new item.

* parentPath {string} : The path of the parent from where the new category item will be created.

* templateName {string} : The path of the template used to create the new item.  By default, this is set to "Project/Demo Shared SXA Sites/SitecoreDemo/Pages/Article Page".

### Example:
https://cm.sitecoredemo.io/performance/additem?name=article1&parentPath=%2Fsitecore%2Fcontent%2FDemo+SXA+Sites%2FLighthouseLifestyle%2Fhome%2FCat1

## Delete Item
Deletes an item based on a specific path.

### Route: http://{site}/performance/delitem
### Parameters
* itemPath {string} : Full path of the item to be deleted.

### Example:
https://cm.sitecoredemo.io/performance/delitem?itemPath=%2Fsitecore%2Fcontent%2FDemo+SXA+Sites%2FLighthouseLifestyle%2Fhome%2FCat1%2Farticle1

## Smart Publish
Uses the Publishing Service to execute Smart Publishing on the site.

### Route: http://{site}/performance/publishsmart
### Parameters
* wait {bool} : true=Wait for publish to complete, false=Submite job and return handle.  Default=false.
* interval {int} : Sleep interval in ms for checking completion of publishing job. Default=1000.

### Example:
https://cm.sitecoredemo.io/performance/publishsmart

## Publish Item
Uses the Publishing Service to execute a Publish Item from the parent Article that was generated using the *Add Article* route.

### Route: http://{site}/performance/publishitem
### Parameters
* pagePrefix {string} : String used to generate the articles.
* deep {bool} : 
   * true=publish parent item and all descendants
   * false=publish only parent item
* wait {bool} : true=Wait for publish to complete, false=Submite job and return handle.  Default=false.
* interval {int} : Sleep interval in ms for checking completion of publishing job. Default=1000.

### Example:
https://cm.sitecoredemo.io/performance/publishitem?pagePrefix=Arc&deep=true

## Publish Result
Retrieves the result of a publishing job.

### Route: http://{site}/performance/publishresult
### Parameters
* handleString {string} : Publishing job handle string in the form '<GUID>;<name>'.

### Example:
https://cm.sitecoredemo.io/performance/publishresult?handleString=391b1cb9-7fb7-4322-9fd6-ab56b4b9052a;CM-LIGHTHOUSE

### Results
If the job is still running, the result will be 

    {"result":"Running"}

If the job has completed, or the handle is incorrect/unknown, the result will be the input handle

    {"result":"<handleString>"}

    e.g. {"result":"391b1cb9-7fb7-4322-9fd6-ab56b4b9052a;CM-LIGHTHOUSE"}