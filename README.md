# Big Bear Planetariums

Website for Big Bear Planetariums, a mobile inflatable planetarium in Ireland. *Educate and Inspire.*

A static site with no build step needed to serve it: open `index.html`, or host the folder on any static host (Vercel, GitHub Pages, Netlify and so on).

- `index.html`: home page (logo intro, hero, audiences, videos, gallery, FAQ, booking)
- `schools.html`, `corporate-groups.html`, `private-parties.html`, `festivals-events.html`: one page per audience
- `css/site.css`, `js/site.js`: shared styles and behaviour for every page
- `tools/build.py`: generates the four audience pages and keeps the header, menu and footer identical everywhere. Edit the page text in its `PAGES` list, then run `python3 tools/build.py`
- `sitemap.xml`, `robots.txt`, `vercel.json`: search-engine files and cache settings (sitemap and robots are written by `tools/build.py`)
- `img/`: optimised photos (WebP) and the logo
- `video/`: hero loop and the full promo video

Contact details live in the `CONTACT` object at the top of `js/site.js` (and `PHONE`/`EMAIL` in `tools/build.py`).

**After editing `css/site.css`, `js/site.js` or the page text in `tools/build.py`, run `python3 tools/build.py` before committing.** It rewrites the pages and stamps the CSS/JS links with a version so visitors always get the newest files.

The enquiry form posts to Web3Forms (key in `CONTACT.formKey` in `js/site.js`) and falls back to opening the visitor's email app if that fails.
