# Vibrant Risk Management Services – Website

A fast, static multi-page website (HTML + CSS + JavaScript). No build step, no framework, no database. Upload the folder to any static host (Cloudflare Pages, Netlify, GitHub Pages, cPanel) and it works.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home: coverage picker, scrolling carrier logos, stats, why us, how it works |
| `medical.html` | Medical insurance: plan types, 30 health carrier logos, doctor/lab/clinic finder, FAQ |
| `life.html` | Life insurance: term / whole / universal, coverage sizing, 15 life carrier logos, FAQ |
| `auto.html` | Auto insurance: what it covers, 4 carriers, FAQ |
| `home-insurance.html` | Home insurance: what it covers, 25 carriers, FAQ |
| `about.html` | About the agency and values |
| `contact.html` | Quote request form, phone, email, map |
| `404.html`, `robots.txt`, `sitemap.xml` | Error page and search-engine files |

## Features
**Navigation and layout**
- Menu: Home, Medical Insurance ▾, Life Insurance ▾, Auto Insurance, Home Insurance, About, Contact Us, plus a "Get a Free Quote" button.
- Dropdowns open on hover, keyboard focus, or by tapping the arrow on phones. Medical lists Individual & Family, Group, Travel, Carriers, Find a Doctor. Life lists Term, Whole, Universal, Carriers.
- Sticky header, current page highlighted, scroll progress bar, back-to-top button, floating call button.
- Fully responsive. Tested at 320, 360, 390, 430 and 768 px wide with no sideways scrolling. Under 1180 px the menu becomes a burger menu that closes after a tap. Respects phone notches and home bars.

**Look and feel**
- **Dark mode:** sun/moon button. Follows the visitor's device setting on first visit, then remembers their choice.
- **Custom cursor:** pink arrow that turns blue with a soft pulse over clickable items, and shows labels like "Open" on some cards. Only on mouse devices; touch devices keep normal behavior.
- **Subtle motion:** gentle card tilt (max about 3 degrees), buttons that lean up to 3 px toward the mouse, drifting background blobs, rotating headline word, scroll-in reveals and animated counters. All motion is turned off for visitors who have "reduce motion" enabled.
- **Sound effects:** short synthesized sounds (no audio files) for clicks, hovers, menus, chat, dark mode and form sending. A speaker button mutes everything, and the choice is remembered. Browsers only allow sound after the visitor's first click.

**Carrier logos**
- Real logos for 30 health and 15 life carriers, State Farm, Progressive, GEICO and National General.
- Each carrier page has a live search box that filters logos as you type.
- A logo that is missing falls back to a clean name tile, so the layout never breaks.
- The home page shows a continuously scrolling strip of logos that pauses on hover.

**Tools for visitors**
- **Quote form** (contact page): name, phone, email, ZIP and coverage checkboxes (Medical, Life, Auto, Home, Help finding care). Links like `contact.html?pick=Auto` preselect the matching box. Checks that at least one coverage is chosen, then sends by email through FormSubmit, with a honeypot and captcha against spam.
- **Provider finder** (medical page): choose doctor, specialist, lab, clinic, urgent care, hospital or dentist, enter a ZIP, and a map search opens.
- **Chat assistant** (all pages): answers questions about services, carriers, enrolling, cost, finding doctors, contact details, and starts a quote. It works offline with built-in answers, or becomes an AI assistant if you deploy `worker/chat-worker.js` (see below).
- **FAQ** on each coverage page, plus a general questions list.

**Search and sharing**
- Page titles and descriptions for every page, `InsuranceAgency` data for search engines on the home page, sitemap and robots files, and a theme color for phone browsers.

## Folder structure
```
*.html                  the seven pages, 404 page
assets/css/style.css    base styles
assets/css/v2.css       dark mode, dropdown menu, logo grids, cursor, phone layout
assets/js/main.js       menu, dark mode, sound, cursor, tilt, reveal, logo search, forms
assets/js/chat.js       chat assistant widget
assets/img/logo.png     agency logo (transparent background)
assets/img/carriers/    carrier logos, one PNG per carrier (file name = carrier name in lowercase with dashes)
worker/chat-worker.js   optional AI backend for the chat (Cloudflare Worker)
scripts/                backup.sh, restore.sh, fetch-logos.sh
```

## Editing the site
- **Text:** open the page in any editor and change the wording. Each section is clearly separated.
- **Phone and email:** search all pages for `764-1992` and `Info@VibrantRiskManagement.Com` (also in `chat.js` and the worker).
- **Add or replace a carrier logo:** save the image in `assets/img/carriers/` as lowercase name with dashes (for example `allstate.png`, `farmers-insurance.png`). Tiles that already exist update automatically. To add a new carrier, copy one `<div class="lg" title="Name">…</div>` block in the right page and change the name and file. Logos should be roughly 700 px wide at most.
- **Fetch missing logos:** run `bash scripts/fetch-logos.sh` on a computer with internet. It downloads icons for carriers with no logo, saved as `<name>-icon.png`. For sharper results get a free logo.dev key and run `LOGO_DEV_TOKEN=yourkey bash scripts/fetch-logos.sh`. Check each brand's logo usage terms.
- **Chat answers about carriers:** edit the `VIBRANT_CARRIERS` list at the top of `assets/js/main.js`. Edit the built-in answers in the `KB` list at the top of `assets/js/chat.js`.
- **Colors:** change the values at the top of `style.css` (`--navy`, `--pink`, `--blue`). Dark mode colors are in `v2.css` under `[data-theme=dark]`.
- **Sound:** all sounds are in the `S` list in `main.js`. Change the numbers (pitch, length, volume) or set `on=false` at the start to make sound off by default.
- **Quote form email:** uses FormSubmit. The first submission sends a confirmation email to Info@VibrantRiskManagement.Com. Click the activation link once, then quotes arrive by email.
- **Life insurance wording and carrier lists** were written as general guidance. Please confirm they match what the agency actually sells.

## Photos
Photos are loaded from Unsplash (free under the Unsplash License, credit appreciated) and are referenced by URL in `index.html`. If a photo ever fails to load, the section falls back to a clean navy panel, so the layout never breaks.
For best speed and reliability, download them once and host locally:
1. Open each `https://images.unsplash.com/photo-...` URL from `index.html` in a browser, save the image into `assets/img/`.
2. Replace the URL in `index.html` with `assets/img/<file>.jpg`.
To use your own photos (office, team, clients), just drop them in `assets/img/` and change the `src`.

## Chat assistant
Works out of the box using built-in answers (services, carriers, enrollment, cost, finding doctors/labs/clinics by ZIP, contact, quote shortcuts). It does not give prices or guarantee coverage.
**To make it a true AI assistant:** deploy `worker/chat-worker.js` (instructions at the top of that file). Your Anthropic API key stays on the server as a secret. Then add this line to `index.html` just before `assets/js/chat.js`:
```html
<script>window.VIBRANT_CHAT_ENDPOINT="https://vibrant-chat.<your-subdomain>.workers.dev";</script>
```
If the AI endpoint is down, the widget automatically falls back to the built-in answers.
Edit the built-in answers in the `KB` list at the top of `assets/js/chat.js`.

## Backup setup
**1. Manual / scheduled local backups**
```
chmod +x scripts/*.sh
./scripts/backup.sh                       # creates ../vibrant-backups/vibrant-site_<date>.tar.gz + checksum
./scripts/restore.sh ../vibrant-backups/vibrant-site_<date>.tar.gz
```
Automatic daily backup at 2 AM (Linux/Mac): `crontab -e` and add
```
0 2 * * * /full/path/to/vibrant-site/scripts/backup.sh
```

**2. Git history (recommended, free)**
```
git init && git add . && git commit -m "Initial redesign"
git remote add origin <your private GitHub repo URL>
git push -u origin main
```

**3. Off-site copy**
Copy the `vibrant-backups` folder to Google Drive/Dropbox weekly (or sync it). Keep the original Google Sites site intact until the new site is live and verified.

## Going live
Upload the folder contents to any static host (Netlify, Cloudflare Pages, GitHub Pages, or your hosting's public_html), then point `www.vibrantriskmanagement.com` DNS to it. Back up the DNS records before changing them.

