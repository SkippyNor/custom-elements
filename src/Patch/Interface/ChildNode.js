import CustomElementInternals from '../../CustomElementInternals.js';
import * as Utilities from '../../Utilities.js';

/**
 * @typedef {{
 *   before: !function(...(!Node|string)),
 *   after: !function(...(!Node|string)),
 *   replaceWith: !function(...(!Node|string)),
 *   remove: !function(),
 * }}
 */
let ChildNodeNativeMethods;

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ChildNodeNativeMethods} builtIn
 */
export default function(internals, destination, builtIn) {
  function patch_before(destination, baseMethod) {
    Utilities.setPropertyUnchecked(destination, 'before',
      /**
       * @param {...(!Node|string)} nodes
       */
      function(...nodes) {
        // TODO: Fix this for when one of `nodes` is a DocumentFragment!
        const connectedBefore = /** @type {!Array<!Node>} */ (nodes.filter(node => {
          // DocumentFragments are not connected and will not be added to the list.
          return node instanceof Node && Utilities.isConnected(node);
        }));

        baseMethod.apply(this, nodes);

        for (let i = 0; i < connectedBefore.length; i++) {
          internals.disconnectTree(connectedBefore[i]);
        }

        if (Utilities.isConnected(this)) {
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node instanceof Element) {
              internals.connectTree(node);
            }
          }
        }
      });
  }

  if (builtIn.before) {
    patch_before(builtIn.before);
  }


  function patch_after(destination, baseMethod) {
    Utilities.setPropertyUnchecked(destination, 'after',
      /**
       * @param {...(!Node|string)} nodes
       */
      function(...nodes) {
        // TODO: Fix this for when one of `nodes` is a DocumentFragment!
        const connectedBefore = /** @type {!Array<!Node>} */ (nodes.filter(node => {
          // DocumentFragments are not connected and will not be added to the list.
          return node instanceof Node && Utilities.isConnected(node);
        }));

        baseMethod.apply(this, nodes);

        for (let i = 0; i < connectedBefore.length; i++) {
          internals.disconnectTree(connectedBefore[i]);
        }

        if (Utilities.isConnected(this)) {
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node instanceof Element) {
              internals.connectTree(node);
            }
          }
        }
      });
  }

  if (builtIn.after) {
    patch_after(destination, builtIn.after);
  }


  function patch_replaceWith(destination, baseMethod) {
    Utilities.setPropertyUnchecked(destination, 'replaceWith',
      /**
       * @param {...(!Node|string)} nodes
       */
      function(...nodes) {
        // TODO: Fix this for when one of `nodes` is a DocumentFragment!
        const connectedBefore = /** @type {!Array<!Node>} */ (nodes.filter(node => {
          // DocumentFragments are not connected and will not be added to the list.
          return node instanceof Node && Utilities.isConnected(node);
        }));

        const wasConnected = Utilities.isConnected(this);

        baseMethod.apply(this, nodes);

        for (let i = 0; i < connectedBefore.length; i++) {
          internals.disconnectTree(connectedBefore[i]);
        }

        if (wasConnected) {
          internals.disconnectTree(this);
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node instanceof Element) {
              internals.connectTree(node);
            }
          }
        }
      });
  }

  if (builtIn.replaceWith) {
    patch_replaceWith(destination, builtIn.replaceWith);
  }


  function patch_remove(destination, baseMethod) {
    Utilities.setPropertyUnchecked(destination, 'remove',
      function() {
        const wasConnected = Utilities.isConnected(this);

        builtIn.remove.call(this);

        if (wasConnected) {
          internals.disconnectTree(this);
        }
      });
  }

  if (builtIn.remove) {
    patch_remove(destination, builtIn.remove);
  }
};
