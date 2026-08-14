/* =====================================================================
   GOOGLE SHEET ENDPOINT

   This file does not run on the website. It is pasted into Google Apps
   Script, which gives the site somewhere to put a copy of every document
   a guest sends, so they collect in one sheet you can sort and search
   instead of only landing in your inbox.

   ---------------------------------------------------------------------
   SETTING IT UP, once, about ten minutes
   ---------------------------------------------------------------------
   1.  Go to sheets.new and make a spreadsheet. Name it something like
       "DJ Mishoo submissions". Leave it empty; the headings are written
       on the first submission.

   2.  In that sheet: Extensions, then Apps Script. Delete whatever is in
       the editor and paste this whole file in. Save.

   3.  Deploy, then New deployment. Choose type "Web app".
         Execute as:        Me
         Who has access:    Anyone
       Press Deploy. Google will ask you to authorise it: that is you
       giving your own script permission to write to your own sheet.

       "Anyone" sounds alarming and is not. It only means the address can
       be reached without a Google login, which it has to be, because the
       people filling in your forms are not signed into your account. The
       TOKEN below is what decides whether a request is actually from your
       site. Nothing here can read the sheet back out: this script only
       ever appends.

   4.  Copy the Web app URL it gives you. It looks like
       https://script.google.com/macros/s/AKfy..../exec
       Send it to me, or paste it into CONFIG.sheet.endpoint in js/app.js.

   ---------------------------------------------------------------------
   IF YOU EVER CHANGE THIS FILE
   ---------------------------------------------------------------------
   Apps Script serves the version you deployed, not the version you saved.
   After editing: Deploy, Manage deployments, edit the existing one, set
   Version to "New version", Deploy. Skipping that is the usual reason a
   change appears to do nothing.
   ===================================================================== */

/* Must match CONFIG.sheet.token in js/app.js. Not a secret in the strict
   sense, since the site's code is public and anyone reading it can find
   this string. It stops a passing bot posting rubbish into your sheet; it
   would not stop somebody who had decided to. Change both together. */
const TOKEN = "8UOeiB1Xa8whxP_xT7Xh8j4-AqyyF9Ia";

const SHEET_NAME = "Submissions";
const HEADINGS = ["Received", "Type", "Client", "Email", "Phone",
                  "Event date", "Venue", "Detail"];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return reply("no body");

    const body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) return reply("bad token");

    const sheet = getSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADINGS);
      sheet.getRange(1, 1, 1, HEADINGS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      body.type      || "",
      body.client    || "",
      body.email     || "",
      body.phone     || "",
      body.eventDate || "",
      body.venue     || "",
      body.detail    || "",
    ]);

    return reply("ok");
  } catch (err) {
    /* Swallowed on purpose. The site sends this without reading the
       answer, and the guest's own copy has already gone to your inbox by
       email, so a failure here must never look like a failed submission. */
    return reply("error: " + err);
  }
}

/* A GET is only ever someone opening the address in a browser. Say as
   little as possible. */
function doGet() {
  return reply("This endpoint accepts submissions only.");
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function reply(text) {
  return ContentService.createTextOutput(text)
    .setMimeType(ContentService.MimeType.TEXT);
}
