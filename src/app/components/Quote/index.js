// External
const cn = require('classnames');
const html = require('bel');

// Ours
const {MOCK_NODE} = require('../../../constants');
const {append, before, detach, getDescendantTextNodes, isElement, isText,
  linebreaksToParagraphs, prepend, select, selectAll, trim} = require('../../../utils');

const DOUBLE_QUOTE_PATTERN = /\"/g; 

function Quote({
  isPullquote = false,
  parEls = [],
  attributionNodes = []
}) {
  const className = cn('Quote', {
    'is-pullquote': isPullquote
  });
  const attributionEl = attributionNodes.length ? html`
    <footer>${Array.from(attributionNodes).map(node => {
      return isText(node) ? trim(node.textContent) : node;
    })}</footer>
  ` : null;

  // TODO: Needs work - some lines are not paragraphs and screw up the toggle

  // if (isPullquote && parEls.length) {
  //   parEls.forEach(parEl => {
  //     let toggle = false;
      
  //     getDescendantTextNodes(parEl)
  //     .forEach(node => {
  //       if (DOUBLE_QUOTE_PATTERN.test(node.nodeValue)) {
  //         node.nodeValue = node.nodeValue.replace(DOUBLE_QUOTE_PATTERN, () => {
  //           return (toggle = !toggle) ? '“' : '”';
  //         });
  //       }
  //     });
  //   });
  // }

  return html`
    <div class="${className}">
      <blockquote>
        ${parEls.concat(attributionEl)}
      </blockquote>
    </div>
  `;
}

function createFromEl(el) {
  if (!isElement(el)) {
    return null;
  }

  const clone = el.cloneNode(true);
  let config;

  if (clone.tagName === 'BLOCKQUOTE') {
    // P1S-B, P1M-B, P2-B, P1S-P, P1M-P
    if (clone.className.indexOf('source-blockquote') > -1) {
      // P2-B
      config = {
        parEls: selectAll('p', clone),
        attributionNodes: (select('footer', clone) || MOCK_NODE).childNodes
      };
    } else {
      // P1S-B, P1M-B, P1S-P, P1M-P
      config = {
        isPullquote: clone.className.indexOf('quote--pullquote') > -1,
        parEls: selectAll('p:not([class])', clone),
        attributionNodes: (select('.p--pullquote-byline', clone) || MOCK_NODE).childNodes
      };
    }
  } else if (clone.tagName === 'ASIDE') {
    // P2-P
    config = {
      isPullquote: true,
      parEls: selectAll('p', clone),
      attributionNodes: (select('footer', clone) || MOCK_NODE).childNodes
    };
  } else if (clone.tagName === 'FIGURE') {
    // P1M-E
    config = {
      isPullquote: true,
      parEls: Array.from(linebreaksToParagraphs(select('blockquote', clone) || MOCK_NODE).childNodes),
      attributionNodes: (select('figcaption', clone) || MOCK_NODE).childNodes
    };
  } else if (clone.className.indexOf('inline-content quote') > -1 ||
      clone.className.indexOf('view-inline-pullquote') > -1) {
    // P1S-E, P2-E
    config = {
      isPullquote: true,
      parEls: selectAll('p', clone),
      attributionNodes: (select('.cite', clone) || MOCK_NODE).childNodes
    };
  }

  if (config) {
    return Quote(config);
  }

  return null;
}

function transformEl(el) {
  before(el, createFromEl(el));
  detach(el);
}

module.exports = Quote;
module.exports.createFromEl = createFromEl;
module.exports.transformEl = transformEl;
