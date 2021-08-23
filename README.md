## Introduction

`wiki-engine` is a minimal, lightweight wiki engine that runs in NodeJS using `LowDB`. It is designed to be extended and used as part of a larger NodeJS application such as an `express` server.

## How to use

### 1. Installation and initialisation

To use the wiki engine, begin by installing it using npm:

    npm install wiki-engine --save`

`wiki-engine` is a pure ES6 module so to use it in any file, import the `Wiki` class from `wiki-engine`:

    import { Wiki } from 'wiki-engine';

Create a wiki by creating an instance of the `wiki` class. The class constructor takes in one parameter, `name` which is the name of the wiki you want to create.

    const wiki = new Wiki('my_wiki');

Then next step is to initialise the wiki. Initialisation is an asynchronous function. So to ensure none of your code runs until the wiki is initialised, use the await keyword.

    await wiki.initialise();

If the wiki already exists, the wiki's data is loaded and the wiki is accessible through that identifier.

It is also possible to have more than one wiki running in a single session as long as they have different names.

    const wiki1 = new Wiki('my_first_wiki');
    const wiki2 = new Wiki('my_second_wiki')`

### 2. Creating pages in your wiki

Once you have an instance of the wiki running, you can create a page in the wiki by calling the `createPage()` method. It requires two string parameters: `title`, which is the title of the page, and `slug`, which is the slug of the page. The slug has to be unique for all pages because it is what `wiki-engine` uses to identify a page.

    wiki.createPage("My first page", "my-first-page");`

The slug will be useful for routing if the app is extended by creating a server using `express`. If you are not particularly concerned about the value of the slug, you can use the `uuid` npm module to generate random and unique slugs.

### 3. Adding contents to your pages

Once the page is created, you can add content using the `createContentVersion()` method. It takes in three string parameters: the `slug` of the page, the `content` to be added, and a `comment` about the content being added or the changes made.

    let slug = "my-first-page";
    let content = "This is the content to my first page which I am going to add";
    let comment = "Added the intro";

    wiki.createContentVersion(slug, content, comment);

It is not possible to change a version once it has been submitted. Therefore to change the content of a page, simply create another version using the same code as above.

When a new version is created, it becomes the latest version of that page's content. Previous versions of that page's content are stored as well. This makes it possible to undo updates. This will be explored later in the document.

Therefore when you revise the content like so:

    wiki.createContentVersion("my-first-page", "content revision 1", "numero uno");
    wiki.createContentVersion("my-first-page", "content revision 2", "numero dos");

All the versions of `my-first-page` content, will be stored and still accessible. Each version is self-contained therefore can be rendered without other previous or later versions.

_N.B: Because the content is going to be stored as a string in a JSON file, any special characters that could lead to conflicts in JSON should be escaped._

If you pass in a slug that does not exist, an exception with the exception code `SLUG_NOT_FOUND` will be thrown.

### 4. Getting the contents of all pages.

To read the contents of all pages you can use the `getAllPages()` method.

    wiki.getAllPages();

This returns a `pages` object where each item represents a page. The key of each item is the `slug` of the page and the value is the data of that page. The structure of `pages` object is shown below:

    {
        "example_page_1": {
            dateCreated": Integer <Unix timestamp> ,
            "title": String,
            "contentVersions": ContentVersion []
        },
        "example_page_2": {
            dateCreated": Integer <Unix timestamp> ,
            "title": String,
            "contentVersions": ContentVersion []
        }
    }

Each page will be identified by a slug, and has data about the date it was created, the page title and the different versions of the page's content that are currently stored. The versions are stored in the `contentVersions` item. Each item in the array follows the structure outlined below:

    {
        "id": String
        "dateCreated": Integer <Unix timestamp>
        "comment": String <Comment attached to the edit>
        "content": String <The specific content>
    }

### 5. Getting the contents of a specific page

To get an individual page you use the `getPage()` method. It takes in a mandatory `slug` parameter and an optional `versionId` parameter. The `slug` parameter is a string representing the slug of the page you want to access. The `versionId` parameter is a string that takes in the version id of a specific version of the page's content you want to access. In the absence of a `version` argument, the function returns the latest version.

    const allVersions = wiki.getPage("my-first-page");
    // This will return a page with latest content version

    const specificVersion = wiki.getPage("my-first-page", "4165075e-7667-4d16");
    // This will return a page with the specified content version

To get a page with all of its contents use the `getPage()` method. That takes in `slug` parameter

    wiki.page("my-first-page");
    // This will return "my-first-page", with all the content versions that acre currently stored.

### 6. Deleting pages

To delete entire pages, use the `deletePage()` method.

    wiki.deletePage("my-first-page");

### 7. Deleting content versions

Each version of a page's content is self-contained, meaning it stores all of its data without dependence on prior or later versions. However the file size of the wiki can get really large when there are many content versions. To control the file size, it is recommended that you delete some page content versions periodically. You can delete using `deleteContentVersion()`.

    let slug = "my-first-page"
    let versionId = "4165075e-7667-4d16";

    wiki.deleteContentVersion(slug, versionId);

Once the content version has been deleted, it is no longer accessible.

### 8. Trimming content versions

The `deleteContentVersion()` deletes one content version at a time. But it's more likely that you will want to delete all versions except the latest one. The `trim()` method does exactly that:

    wiki.trim("my-first-page")
    // Deletes every content version of my-first-page except the latest one

The `deleteContentVersion()` deletes a specific version of your page's content from the page. The method takes in two arguments: the `slug` of the page and the `versionId`.

### 9. Delete all except

You can also delete all content versions except one using the `deleteAllContentVersionsExcept()` method.

    wiki.deleteAllContentVersionsExcept("my-first-page", "4165075e-7667-4d16")
    //This deletes all content versions of my-first-page except the one specified.

### 10. Updating page title

To update a page's title, use the `updateTitle()` method. It takes in the `slug` of the page and the new `title`. Both parameters are strings.

    wiki.updateTitle("my-first-page", "New Title")

### 11. Updating a page's slug

To change a page's slug, use the `updateSlug()` method. As parameters to the method, pass in the `oldSlug` and the `newSlug`.

    let oldSlug = "foo";
    let newSlug = "bar";
    wiki.updateSlug(oldSlug, newSlug);
