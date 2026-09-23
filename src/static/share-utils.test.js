const test = require("node:test");
const assert = require("node:assert/strict");

const {
  copyTextToClipboard,
  createActivityShareUrl,
  decodeActivityHash,
} = require("./share-utils.js");

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
