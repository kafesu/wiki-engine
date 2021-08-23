import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

export class Wiki {
    constructor (name) {
        this.DATABASE_NAME = name + ".json";
        this.db = {}
    }

    async initialise () {
        //Creating the file path
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const file = join(__dirname, this.DATABASE_NAME);

        //Creating the adapter and reading the file
        const adapter = new JSONFile(file);
        this.db = new Low(adapter);

        //Reading the data
        await this.db.read();
        
        this.db.data = this.db.data || { pages: {} }
    }

    // Returns a reference to a page using a slug
    page (slug) {
        if ( !this.db.data.pages[slug] ) {
            throw `SLUG_NOT_FOUND`;
        }
        return this.db.data.pages[slug];
    }

    createPage (title, slug) {
        if ( this.db.data.pages[slug] ) {
            throw "PAGE_ALREADY_EXISTS";
        }

        let newPage = {
            dateCreated: Date.now(),
            title: title,
            contentVersions: []
        };

        this.db.data.pages[slug] = newPage;
        this.db.write();
    }

    createContentVersion (slug, content, comment) {
        let contentVersion = { 
            id: uuidv4(),
            dateCreated: Date.now(), 
            comment: comment,
            content: content
        }

        this.page(slug).contentVersions.push(contentVersion);
        this.db.write();
    }

    getAllPages () {
        return this.data.pages;
    }

    getPage (slug, version) {
        let { dateCreated, title, contentVersions } = page(slug);
        let content = version ? contentVersions.filter(x => x.id == version)[0]: contentVersions.slice(-1);
         
        let page = {
            dateCreated: dateCreated,
            title: title,
            content: content
        }

        return page;
    }

    getPageAll (slug) {
        return this.page(slug);
    }

    // UPDATE

    updatePageTitle(slug, newTitle) {
        this.page(slug).title = newTitle;
        this.db.write();
    }

    updatePageSlug(oldSlug, newSlug) {
        this.db.data.pages[newSlug] = this.page(oldSlug);
        delete this.db.data.pages[oldSlug];
        this.db.write();
    }

    // DELETE
    deletePage (slug) {
        try {
            delete this.db.data.pages[slug];
            this.db.write();
        } catch (e) {
            throw e;
        }
    }

    deleteContentVersion (slug, versionId) {
        this.pages(slug).contentVersion = this.pages(slug).contentVersion.filter(x => x != versionId);
        this.db.write();
    }

    deleteAllContentVersionsExcept(slug, versionId) {
        this.pages(slug).contentVersion = this.pages(slug).contentVersion.filter(x => x == versionId);
        this.db.write();
    }

    trim(slug) {
        // deletes all content versions except latest one
        let length = this.page(slug).contentVersions.length;
        this.page(slug).contentVersions.splice(0, length - 1);
        this.db.write();
    }
}
