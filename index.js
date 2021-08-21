import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file);
const db = new Low(adapter);
await db.read();

export default class Wiki {
    constructor () {
        this.db = db;
    }

    // Returns a reference to a page using a slug
    page (slug) {
        if ( !this.db.data.pages[slug]) {
            throw `Page with slug ${slug} does not exist`;
        }
        return this.db.data.pages[slug];
    }

    createPage (title, slug, tags = []) {
        this.db.data.pages[slug] = {
            dateCreated: Date.now(),
            title: title,
            tags: tags,
            contentVersions: []
        };
        this.db.write();
    }

    createContentVersionForPage (slug, content) {
        let contentVersion = { dateCreated: Date.now(), content: content }
        this.page(slug).contentVersions.push(contentVersion);
        this.db.write();
    }

    // READ

    getPageWithAllContentVersions (slug) {
        return this.page(slug);
    }

    getPageWithLatestContentVersion (slug) {
        let { dateCreated, title, tags, contentVersions } = this.page(slug);
        let latestContentVersion = contentVersions.slice(-1);
        return {
            dateCreated: dateCreated,
            title: title,
            tags: tags,
            content: latestContentVersion
        }
    }

    // UPDATE

    updatePageTitle(slug, newTitle) {
        this.page(slug).title = newTitle;
        this.db.write();
    }

    updatePageTags(slug, newTags) {
        this.page(slug).tags = newTags;
        this.db.write();
    }

    updatePageSlug(oldSlug, newSlug) {
        this.db.data.pages[newSlug] = this.page(oldSlug);
        delete this.db.data.pages[oldSlug];
        this.db.write();
    }

    // DELETE
    deletePage (slug) {
        delete this.db.data.pages[slug];
        this.db.write();
    }

    popContentVersionOfPage(slug) {
        this.page(slug).contentVersions.pop();
        this.db.write();
    }

    trimContentVersions(slug) {
        // deletes all content versions except latest one
        let length = this.page(slug).contentVersions.length;
        this.page(slug).contentVersions.splice(0, length - 1);
        this.db.write();
    }
}
