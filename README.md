# Sapphic Speed Dating

A phone-friendly speed dating app. Guests scan a QR code, check in, see their table and date each round, and make private picks. When you reveal matches, each guest sees only their mutual matches and those people's contact info.

- `index.html`: the guest page (what people open on their phones)
- `host.html`: your control panel
- `firestore.rules`: privacy rules that keep picks and contact info private
- `firebase-config.js`: where your Firebase keys go

It runs free on **GitHub Pages** (hosting) and **Firebase** (logins + database). Setup takes about 20 minutes.

---

## Part 1: Firebase (the database and logins)

**1. Create a project.** Go to https://console.firebase.google.com, click **Create a project**, name it something like `sapphic-speed-dating`. You can turn off Google Analytics.

**2. Register a web app.** On the project home, click the **</>** (Web) icon. Nickname it `speed-dating`. Don't check "Firebase Hosting." Firebase shows you a `firebaseConfig` block like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sapphic-speed-dating.firebaseapp.com",
  ...
};
```

Copy those six values into `firebase-config.js`, replacing each `PASTE_...`. (These keys are meant to be public; the rules file is what protects the data.)

**3. Turn on logins.** In the left menu: **Build → Authentication → Get started**. Under **Sign-in method**, enable:
- **Anonymous** (guests: no account needed, they just open the link)
- **Email/Password** (you, the host)

Then go to the **Users** tab → **Add user**. Enter your email and a strong password. After it's created, copy the long **User UID** in that row (example: `k3Jd9fQ2xLhW...`).

Paste that UID in two places:
- `firebase-config.js` → `HOST_UID = "..."`
- `firestore.rules` → `request.auth.uid == '...'`

**4. Create the database.** **Build → Firestore Database → Create database**. Pick **Start in production mode** and a location near you (`us-east1` is fine for Florida). Once it's created, open the **Rules** tab, delete what's there, paste in all of `firestore.rules`, and click **Publish**.

---

## Part 2: GitHub Pages (putting it online)

**5. Create the repo.** On GitHub, click **New repository**. Name it `speed-dating`, set it to **Public**, and create it.

**6. Upload the files.** Click **Add file → Upload files**, drag in all the files from this folder (with your edited `firebase-config.js`), and click **Commit changes**.

**7. Turn on Pages.** In the repo: **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main**, folder **/ (root)**, and **Save**. In a minute or two your site is live at:

```
https://YOUR-USERNAME.github.io/speed-dating/
```

**8. Let Firebase trust your site.** Back in Firebase: **Authentication → Settings → Authorized domains → Add domain**, and enter `YOUR-USERNAME.github.io` (no `https://`, no `/speed-dating`).

---

## Part 3: Test it before the night

**9.** On your laptop, open `https://YOUR-USERNAME.github.io/speed-dating/host.html` and sign in with the email and password from step 3.

**10.** Create a test event. Scan the QR code with your phone and check in. Then check in with a second phone (or a private/incognito window, which counts as a separate guest).

**11.** Start round 1, make some picks on both phones, end rounds, and reveal. Both phones should show the match. Click **Switch event** when you're done testing so the real night starts fresh.

---

## How the night runs

1. **Doors open:** Put the host page on a laptop or tablet by the entrance (or print the QR code). Guests scan, check in, confirm they're 21+, and get a badge number for their name tag. Keep the host page open; it's what hands out badge numbers.
2. **No phone?** Use "Add someone without a phone" on the host page. Give them a paper scorecard.
3. **Big crowd? Split it up:** Before starting, set **Groups** on the host page (try 2 or 3 for 30+ people). Guests are split at random when you start, and they only meet people in their own group, so everyone gets through their whole group in fewer rounds. Everyone can stay in one room: table numbers don't overlap between groups. You can also lower **Rounds** so each person meets fewer people.
4. **Start round 1:** Check-in closes. Every phone shows "Table 4, you're meeting Alex" with a countdown. Your screen shows every table, which is great for projecting.
5. **Each round:** Hit **Start round 2**, **Start round 3**, and so on. Guests can mark Date/Friend/Pass right after each date while it's fresh.
6. **After the last round:** Click **End rounds and open final picks**. Guests review and tap **Send my picks**. Enter any paper cards using "Enter a paper scorecard."
7. **Reveal:** Click **Reveal matches**. Every phone shows that person's mutual matches with contact info. Copy messages for anyone without a phone.

**What's private:** Guests can see the names, pronouns, and badge numbers of people at the same event. Contact info and picks are visible only to that guest and you. Contact info is only shared with mutual matches at reveal.

## Notes
- Firebase's free plan easily covers an event of this size.
- To change wording or colors later, edit the files on GitHub (click a file → pencil icon) and commit. The site updates in a minute or two.
