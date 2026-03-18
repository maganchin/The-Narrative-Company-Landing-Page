// Paste this into Google Apps Script (Extensions > Apps Script in your Google Sheet)
// Then: Deploy > New deployment > Web app
// Set "Execute as" = Me, "Who has access" = Anyone
// Copy the deployment URL and add it to .env.local as GOOGLE_SCRIPT_URL

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "First Name", "Email", "Phone", "NPC Personality"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }

    sheet.appendRow([
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      data.firstName || "",
      data.email || "",
      data.phone || "",
      data.npcPersonality || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: test by running this manually in the editor
function testPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        firstName: "Test",
        email: "test@example.com",
        phone: "555-1234",
        npcPersonality: "Wise merchant who only speaks in riddles",
      }),
    },
  };
  Logger.log(doPost(fakeEvent).getContent());
}
