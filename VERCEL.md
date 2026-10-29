# Putting the invitation on Vercel

The invitation and the guest list run on Vercel. The guest list and every reply are kept in a free
Neon database in Singapore. Vercel builds the site from GitHub, so only what is pushed goes live.
Allow about 20 minutes the first time.

## Before you start

Vercel publishes the **main** branch as the real site. Get everything onto main and push it to
GitHub first, including the invitation changes you want guests to see.

## 1. Create the project

1. Go to <https://vercel.com/new?teamSlug=mark-6689> and choose **Import** next to
   `markjehan/wedding-invite`. If it isn't listed, choose **Adjust GitHub App Permissions** and allow
   that repository.
2. Vercel says “Multiple applications detected” and lists **server** and **app**. On the **app** row
   (the one marked `/`), press **Import single project**. Leave **Root Directory** as `./`.
3. You don't need any environment variables. The secret key is made from the database's own
   password. If you have chosen a last day for replies, you can add `INVITE_RSVP_DEADLINE`, like
   `2026-11-20`.
4. Press **Deploy**. **The first build will fail** with “No DATABASE_URL”. That is expected: the
   database comes next.

## 2. Add the database

1. In the project, open **Storage**, then **Create Database**, then **Neon** (Serverless Postgres).
2. Choose the region **Singapore (ap-southeast-1)** and the **Free** plan.
3. Connect it to the project for all environments. Vercel then adds `DATABASE_URL` for you.
4. Open **Deployments**, press **⋯** on the failed one, then **Redeploy**. This time it builds, sets
   up the database tables, and goes live at `https://<project-name>.vercel.app`.

## 3. Make your sign-in

The live site starts with nobody on the guest list and no accounts.

1. In Vercel, open **Storage**, choose the database, then **Show secret** next to
   `DATABASE_URL_UNPOOLED`, and copy it.
2. In a **new** PowerShell window, in this folder, run these, pasting the address between the quotes:

   ```
   $env:DATABASE_URL = "paste it here"
   server\.venv\Scripts\python.exe server\manage.py createsuperuser
   ```

   Choose a username and a strong password. Do the same for anyone else who should have their own
   sign-in, like an uncle or aunt helping out.
3. Close that PowerShell window when you're done. Closing it puts the laptop back on its own test list.
4. Open `https://<project-name>.vercel.app/admin/`, sign in, and scan the code with an authenticator
   app. Keep the backup codes it shows you somewhere safe.

## 4. Check it

- Add yourself as a guest, or bring in the guest list with **Add from Excel**.
- Open your own link on your phone, reply, and check the reply appears on **Home**.

## Later: your own domain

1. In Vercel, open **Settings**, then **Domains**, and add the domain. Follow what it says to set up
   the domain where you bought it.
2. In **Settings**, then **Environment Variables**, add `INVITE_SITE_URL` = `https://yourdomain.com`.
   This is the address WhatsApp messages and the Excel download use.
3. Redeploy.

## Good to know

- Only the main (Production) address is open to guests. Vercel puts other branches' preview
  addresses behind a Vercel sign-in.
- After a quiet spell, the first visit takes a second or two longer while the site wakes up.
- To keep a copy of the list, press **Download the list as Excel** on the admin's Home page.
- Your laptop keeps its own separate test list (`server/data/`). Nothing on it reaches the live site.
