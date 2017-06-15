import CustomElementInternals from '../../CustomElementInternals.js';
import * as Utilities from '../../Utilities.js';

/**
 * @typedef {{
 *   prepend: !function(...(!Node|string)),
  *  append: !function(...(!Node|string)),
 * }}
 */
let ParentNodeNativeMethods;

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ParentNodeNativeMethods} builtIn
 */
export default function(internals, destination, builtIn) {
  function patch_prepend(destination, baseMethod) {
    Utilities.setPropertyUnchecked(destination, 'prepend',
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

  if (builtIn.prepend) {
    patch_prepend(destination, builtIn.prepend);
  }


  function patch_append(destination, baseMethod) {
    Utilities.setPropertyUnchecked(destination, 'append',
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

  if (builtIn.append) {
    patch_append(destination, builtIn.prepend);
  }
};
