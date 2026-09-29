# Big Bear Planetariums

Website for Big Bear Planetariums, a mobile inflatable planetarium in Ireland. *Educate and Inspire.*

A static single page: open `index.html`, or host the folder on any static host (GitHub Pages, Netlify and so on).

- `index.html`: home page (logo intro, hero, audiences, videos, gallery, FAQ, booking)
- `schools.html`, `corporate-groups.html`, `private-parties.html`, `festivals-events.html`: one page per audience
- `css/site.css`, `js/site.js`: shared styles and behaviour for every page
- `tools/build.py`: generates the four audience pages and keeps the header, menu and footer identical everywhere. Edit the page text in its `PAGES` list, then run `python3 tools/build.py`
- `img/`: optimised photos (WebP) and the logo
- `video/`: hero loop and the full promo video

Contact details live in the `CONTACT` object at the top of `js/site.js` (and `PHONE`/`EMAIL` in `tools/build.py`).
