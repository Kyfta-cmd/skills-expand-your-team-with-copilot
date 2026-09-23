const test = require("node:test");
const assert = require("node:assert/strict");

const {
  copyTextToClipboard,
  createActivityDomIdValue,
  createActivityShareText,
  createActivityShareUrl,
  decodeActivityHash,
} = require("./share-utils.js");

test("createActivityDomIdValue returns a share-safe id value", () => {
  assert.equal(createActivityDomIdValue("Drama Club!"), "Drama-20Club!");
});

test("createActivityShareText includes the activity details and schedule", () => {
  assert.equal(
    createActivityShareText(
      "Chess Club",
      { description: "Learn strategies and compete in chess tournaments" },
      "Monday, 3:15 PM - 4:45 PM"
    ),
    "Check out Chess Club at Mergington High School! Learn strategies and compete in chess tournaments Meets Monday, 3:15 PM - 4:45 PM."
  );
});

test("createActivityShareUrl preserves the current path and query string", () => {
  const shareUrl = createActivityShareUrl(
    "https://example.com/school/static/index.html?view=cards",
    "Chess Club"
  );

  assert.equal(
    shareUrl,
    "https://example.com/school/static/index.html?view=cards#Chess%20Club"
  );
});

test("decodeActivityHash decodes valid activity names", () => {
  assert.equal(decodeActivityHash("#Chess%20Club"), "Chess Club");
});

test("decodeActivityHash falls back to the raw hash when decoding fails", () => {
  assert.equal(decodeActivityHash("#Bad%2"), "Bad%2");
});

test("copyTextToClipboard uses the clipboard API in secure contexts", async () => {
  let copiedValue = "";

  const result = await copyTextToClipboard("share-link", {
    navigator: {
      clipboard: {
        writeText: async (value) => {
          copiedValue = value;
        },
      },
    },
    isSecureContext: true,
  });

  assert.equal(result, "clipboard");
  assert.equal(copiedValue, "share-link");
});

test("copyTextToClipboard falls back to execCommand when needed", async () => {
  const appendedNodes = [];
  const removedNodes = [];
  let selected = false;

  const documentStub = {
    body: {
      appendChild: (node) => appendedNodes.push(node),
      removeChild: (node) => removedNodes.push(node),
    },
    createElement: () => ({
      style: {},
      setAttribute: () => {},
      select: () => {
        selected = true;
      },
    }),
    execCommand: (command) => command === "copy",
  };

  const result = await copyTextToClipboard("share-link", {
    document: documentStub,
    isSecureContext: false,
    navigator: {},
  });

  assert.equal(result, "execCommand");
  assert.equal(appendedNodes.length, 1);
  assert.equal(removedNodes.length, 1);
  assert.equal(selected, true);
});

test("copyTextToClipboard throws when execCommand fails", async () => {
  const documentStub = {
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
    createElement: () => ({
      style: {},
      setAttribute: () => {},
      select: () => {},
    }),
    execCommand: () => false,
  };

  await assert.rejects(
    copyTextToClipboard("share-link", {
      document: documentStub,
      isSecureContext: false,
      navigator: {},
    }),
    /Copy command was rejected/
  );
});
