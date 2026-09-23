(function (global) {
  function createActivityDomIdValue(activityName) {
    return encodeURIComponent(activityName).replace(/%/g, "-");
  }

  function createActivityShareUrl(currentHref, activityName) {
    const url = new URL(currentHref);
    url.hash = encodeURIComponent(activityName);
    return url.toString();
  }

  function createActivityShareText(activityName, details, formattedSchedule) {
    return `Check out ${activityName} at Mergington High School! ${details.description} Meets ${formattedSchedule}.`;
  }

  function decodeActivityHash(hashValue) {
    const rawHash = hashValue.startsWith("#") ? hashValue.slice(1) : hashValue;

    try {
      return decodeURIComponent(rawHash);
    } catch (error) {
      return rawHash;
    }
  }

  async function copyTextToClipboard(text, options = {}) {
    const navigatorObject = options.navigator ?? global.navigator;
    const documentObject = options.document ?? global.document;
    const secureContext = options.isSecureContext ?? global.isSecureContext;

    if (navigatorObject?.clipboard && secureContext) {
      await navigatorObject.clipboard.writeText(text);
      return "clipboard";
    }

    const textArea = documentObject.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    documentObject.body.appendChild(textArea);
    textArea.select();
    const copied = documentObject.execCommand("copy");
    documentObject.body.removeChild(textArea);

    if (!copied) {
      throw new Error("Copy command was rejected");
    }

    return "execCommand";
  }

  const shareUtils = {
    copyTextToClipboard,
    createActivityDomIdValue,
    createActivityShareText,
    createActivityShareUrl,
    decodeActivityHash,
  };

  global.shareUtils = shareUtils;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = shareUtils;
  }
})(typeof window !== "undefined" ? window : globalThis);
