# SK Digital Engagement Hub

Website-only academic/testing prototype for the youth of Barangay Santo Rosario Old, Zaragoza, Nueva Ecija.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase Auth + PostgreSQL + RLS
- GitHub
- Vercel

No React, Vue, Angular, Flutter, PHP, Node backend, MySQL, or native mobile app is required.

## 1. Project structure

```text
sk-digital-engagement-hub/
├── index.html
├── announcements.html
├── events.html
├── event-details.html
├── youth-voice.html
├── polls.html
├── notifications.html
├── profile.html
├── about.html
├── login.html
├── register.html
├── admin/
├── css/
├── js/
├── database/
├── README.md
└── .gitignore
```

## 2. Create Supabase project

1. Open Supabase and create a new project.
2. Choose a project name and a strong database password.
3. Wait for the project to finish provisioning.
4. Open **Project Settings > API**.
5. Copy the **Project URL**.
6. Copy the browser-safe **Publishable/anon key**.
7. Do NOT copy or publish the `service_role`/secret key.

## 3. Configure the website

Open `js/supabase-config.js` and replace:

```js
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLIC_KEY";
```

with your public Supabase values.

Only the public/anon/publishable key belongs in frontend code.

## 4. Create the database

In Supabase:

1. Open **SQL Editor**.
2. Create a new query.
3. Paste all of `database/schema.sql`.
4. Run it.
5. Create another query.
6. Paste all of `database/rls-policies.sql`.
7. Run it.

RLS is deliberately enabled. Do not disable it to fix frontend errors.

## 5. Authentication

Supabase Auth uses email/password. The registration page calls:

```js
supabaseClient.auth.signUp({
  email,
  password
});
```

Login uses:

```js
supabaseClient.auth.signInWithPassword({
  email,
  password
});
```

Logout uses:

```js
await supabaseClient.auth.signOut();
```

Passwords are never stored by this website.

The database trigger automatically creates a youth profile after a new Auth user is created.

## 6. Create the demo officer

For the academic prototype, create an Auth user in:

**Supabase Dashboard > Authentication > Users > Add user**

Email:

`admin@skhub.test`

Password:

`admin123`

Then find that user's UUID and run:

```sql
update public.profiles
set role='sk_officer', full_name='SK Demo Officer'
where id='PASTE-AUTH-USER-UUID-HERE';
```

Create the youth account:

`juan@skhub.test`

Password:

`user123`

Its profile should remain `youth`.

For the requested 10-youth demo set, create eight additional fictional Auth users manually. Their profiles will be created automatically.

> These credentials are fictional testing credentials. Do not use them for a real production system.

## 7. Demo content

Open `database/demo-data.sql`. Replace the officer UUID placeholder with the actual Auth UUID and run the examples.

You can also create announcements, events and polls from `/admin` after the officer account works.

## 8. Test locally

Because this is static HTML, you do not need PHP, Node.js, or MySQL.

For a simple local test, open `index.html` in a browser. If your browser blocks some local requests, use a simple static web server.

On desktop:

```bash
python -m http.server 5500
```

Then open:

`http://localhost:5500`

## 9. GitHub

### Beginner method

1. Create/sign in to GitHub.
2. Create a new repository named `sk-digital-engagement-hub`.
3. Keep it private while developing if desired.
4. Upload the project folders and files.
5. Commit the files.

### Git command method

```bash
git init
git add .
git commit -m "Initial SK Digital Engagement Hub"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Never commit service-role keys, passwords, or private credentials.

## 10. Vercel

1. Create/sign in to Vercel.
2. Choose **Add New Project**.
3. Import the GitHub repository.
4. Deploy.
5. No traditional server is required.
6. If you keep the Supabase values directly in `supabase-config.js`, redeploy after changing them.
7. Alternatively, refactor the configuration to your preferred public deployment configuration.

## 11. Supabase Auth URL configuration

After Vercel gives you a domain, open Supabase:

**Authentication > URL Configuration**

Set the Site URL to your Vercel URL.

Add the Vercel URL to the allowed redirect URLs if your project settings require it.

For example, your deployed site might be:

`https://your-project.vercel.app`

Do not copy that example literally.

## 12. Common problems

### "Invalid API key"
Check that the Project URL and public/anon/publishable key are correct. Never use the service-role key in the browser.

### "new row violates row-level security policy"
Check that you ran `schema.sql` and `rls-policies.sql`, and that the logged-in user's profile has the correct role.

### Youth is redirected from admin
That is intentional. Only a profile with `role='sk_officer'` can access admin pages.

### Registration says duplicate
The database has `unique(event_id,user_id)`. This is intentional protection against duplicate registrations.

### Poll says duplicate
The database has `unique(poll_id,user_id)`. This is intentional protection against duplicate votes.

### Signup works but profile is missing
Confirm the `handle_new_user` trigger from `schema.sql` exists and that the signup succeeded.

### Admin cannot create content
Confirm the current Auth user's `profiles.role` is exactly `sk_officer`.

### Email confirmation prevents immediate login
For a classroom/testing environment, review Supabase Authentication email-confirmation settings. For a real deployment, use the confirmation flow rather than disabling security.

## 13. Security notes

- Never expose the Supabase service-role/secret key.
- Authorization is enforced with Supabase RLS, not only JavaScript.
- The frontend is untrusted.
- Passwords are handled by Supabase Auth.
- Event registrations have a database-level unique constraint.
- Poll votes have a database-level unique constraint.
- Youth Voice keeps the user relationship so users can track submissions while the anonymous flag can hide identity from the normal admin display.

## 14. Scope

This prototype intentionally excludes mobile apps, native apps, financial assistance, scholarship processing, official barangay transactions, payments, video conferencing, live chat, and social-media messaging.
