const reservedTagList = new Set([
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
]);

/**
 * @param {string} localName
 * @returns {boolean}
 */
export function isValidCustomElementName(localName) {
  const reserved = reservedTagList.has(localName);
  // Allow non-dashed names for testing in browser chrome.
  const validForm = true;
  // const validForm = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(localName);
  return !reserved && validForm;
}

/**
 * @private
 * @param {!Node} node
 * @return {boolean}
 */
export function isConnected(node) {
  // Use `Node#isConnected`, if defined.
  const nativeValue = node.isConnected;
  if (nativeValue !== undefined) {
    return nativeValue;
  }

  /** @type {?Node|undefined} */
  let current = node;
  while (current && !(current.__CE_isImportDocument || current instanceof Document)) {
    current = current.parentNode || (window.ShadowRoot && current instanceof ShadowRoot ? current.host : undefined);
  }
  return !!(current && (current.__CE_isImportDocument || current instanceof Document));
}

/**
 * @param {!Node} root
 * @param {!Node} start
 * @return {?Node}
 */
function nextSiblingOrAncestorSibling(root, start) {
  let node = start;
  while (node && node !== root && !node.nextSibling) {
    node = node.parentNode;
  }
  return (!node || node === root) ? null : node.nextSibling;
}

/**
 * @param {!Node} root
 * @param {!Node} start
 * @return {?Node}
 */
function nextNode(root, start) {
  return start.firstChild ? start.firstChild : nextSiblingOrAncestorSibling(root, start);
}

/**
 * @param {!Node} root
 * @param {!function(!Element)} callback
 * @param {!Set<Node>=} visitedImports
 */
export function walkDeepDescendantElements(root, callback, visitedImports = new Set()) {
  // Firefox-specific wrapper to walk tree (including XBL / XUL / anon content)
  let Ci = Components.interfaces;
  let Cc = Components.classes;
  let walker = Components.classes["@mozilla.org/inspector/deep-tree-walker;1"].
               createInstance(Components.interfaces.inIDeepTreeWalker);
  walker.showAnonymousContent = true;
  walker.showSubDocuments = false;
  walker.showDocumentsAsNodes = false;
  walker.init(root, Ci.nsIDOMNodeFilter.SHOW_ELEMENT);

  callback(root);

  while (walker.nextNode()) {
    if (walker.currentNode instanceof Element) {
      callback(walker.currentNode);
    }
  }
}

/**
 * Used to suppress Closure's "Modifying the prototype is only allowed if the
 * constructor is in the same scope" warning without using
 * `@suppress {newCheckTypes, duplicate}` because `newCheckTypes` is too broad.
 *
 * @param {!Object} destination
 * @param {string} name
 * @param {*} value
 */
export function setPropertyUnchecked(destination, name, value) {
  destination[name] = value;
}
