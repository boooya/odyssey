// External
const html = require('bel');

// Ours
const {SELECTORS, NOEL} = require('../../constants');
const {detach, isText, trim, select, selectAll, slice} = require('../../utils');

const EMPHASISABLE_BYLINE_TEXT_PATTERN = /^(?:by|,|and)$/;

const FACEBOOK = /facebook\.com/;
const TWITTER = /twitter\.com/;
const WHATS_APP = /whatsapp:/;
const REDDIT = /reddit\.com/;
const EMAIL = /mailto:/;

const SHARE_ORDERING = [
  'facebook',
  'twitter',
  'whatsapp',
  'reddit',
  'email'
];

function getMetaContent(name) {
  const el = select(`meta[name="${name}"]`);

  return el ? el.getAttribute('content') : null;
}

function getDate(metaElName, timeElClassName) {
  return new Date(Date.parse(
    getMetaContent(metaElName) ||
    (select(`time.${timeElClassName}`) || NOEL).getAttribute('datetime')
  ));
}

function getBylineNodes() {
  const infoSourceEl = select(SELECTORS.INFO_SOURCE);
  const bylineEl = select(SELECTORS.BYLINE);
  const bylineSubEl = select('p', bylineEl);

  return slice((bylineSubEl || bylineEl).childNodes)
  .filter(node => node !== infoSourceEl && trim(node.textContent).length > -1)
  .map(node => {
    const clonedNode = node.cloneNode(true);

    if (EMPHASISABLE_BYLINE_TEXT_PATTERN.test(trim(node.textContent).toLowerCase())) {
      return html`<em>${clonedNode}</em>`
    };

    return clonedNode;
  });
}

function getInfoSource() {
  let infoSourceLinkEl = select(SELECTORS.INFO_SOURCE_LINK);

  if (!infoSourceLinkEl) {
    const infoSourceMetaContent = getMetaContent('ABC.infoSource');

    if (infoSourceMetaContent) {
      infoSourceLinkEl = select(`a[title="${infoSourceMetaContent}"]`);
    }
  }

  return infoSourceLinkEl ? {
    name: trim(infoSourceLinkEl.textContent),
    url: infoSourceLinkEl.href
  } : null;
}

function getShareLinks() {
  return selectAll('a', select(SELECTORS.SHARE_TOOLS))
  .reduce((links, linkEl) => {
    const href = linkEl.href;

    switch (href) {
      case ((href.match(FACEBOOK) || {}).input):
        links.push({id: 'facebook', href});
        break;
      case ((href.match(TWITTER) || {}).input):
        links.push({id: 'twitter', href});
        break;
      case ((href.match(WHATS_APP) || {}).input):
        links.push({id: 'whatsapp', href});
        break;
      case ((href.match(REDDIT) || {}).input):
        links.push({id: 'reddit', href});
        break;
      case ((href.match(EMAIL) || {}).input):
        links.push({id: 'email', href});
        break;
      default:
        break;
    }

    return links;
  }, [])
  .sort((a, b) => SHARE_ORDERING.indexOf(a.id) - SHARE_ORDERING.indexOf(b.id));
}

function getMeta() {
  return {
    title: getMetaContent('replacement-title') ||
      getMetaContent('replacement-title') ||
      select('h1').textContent,
    published: getDate('DCTERMS.issued', 'original'),
    updated: getDate('DCTERMS.modified', 'updated'),
    bylineNodes: getBylineNodes(),
    infoSource: getInfoSource(),
    shareLinks: getShareLinks(),
  };
}

module.exports = {
  getMeta
};
