// Ours
const {SELECTORS} = require('../constants');
const {after, before, detachAll, getPlaceholders, getSections, isElement, select, selectAll} = require('../utils');
const Header = require('./components/Header');
const Nav = require('./components/Nav');
const Share = require('./components/Share');
const UPull = require('./components/UPull');
const {getMeta} = require('./meta');
const reset = require('./reset');

function app(done) {
  const meta = getMeta(); // Must happen before the story reset
  const storyEl = reset(select(SELECTORS.STORY));

  after(select(SELECTORS.GLOBAL_NAV), Nav({shareLinks: meta.shareLinks}));

  getPlaceholders([
    'share',
  ]).forEach(placeholder => {
    switch (placeholder.name) {
      case 'share':
        Share.transformPlaceholder(placeholder, meta.shareLinks);
        break;
      default:
        break;
    }
  });

  getSections([
    'header',
    'pull'
  ]).forEach(section => {
    switch (section.name) {
      case 'header':
        Header.transformSection(section, meta);
        break;
      case 'pull':
        UPull.transformSection(section);
        break;
      default:
        break;
    }
  });

  // Enable parallax
  const parallaxes = selectAll('.u-parallax')
  .map(el => ({
    el,
    mediaEl: select('img, video', el),
    nextEl: el.nextElementSibling,
    state: {opacity: 1, translateY: 0},
    nextState: {}
  }))
  .filter(parallax => parallax.mediaEl);

  if (parallaxes.length > 0) {
    function updateNextStates() {
      parallaxes.forEach(parallax => {
        const rect = parallax.el.getBoundingClientRect();

        if (rect.bottom < 0 || rect.top > rect.height) {
          return;
        }

        const top = Math.min(0, rect.top);
        const opacityExtent = parallax.nextEl ?
          parallax.nextEl.getBoundingClientRect().top - top :
          rect.height;

        parallax.nextState = {
          opacity: 1 + top / opacityExtent,
          translateY: -33.33 * (top / rect.height),
        };
      });
    }

    window.requestAnimationFrame(function updateMediaEls() {
      parallaxes.forEach(parallax => {
        if (parallax.nextState.translateY !== parallax.state.translateY) {
          parallax.state = parallax.nextState;
          parallax.mediaEl.style.opacity = parallax.state.opacity;
          parallax.mediaEl.style.transform = `translateY(${parallax.state.translateY}%)`;
        }
      });

      window.requestAnimationFrame(updateMediaEls);
    });

    window.addEventListener('scroll', updateNextStates);
    window.addEventListener('resize', updateNextStates);
    window.addEventListener('load', updateNextStates);
  }

  // Nullify nested pulls (outer always wins)
  selectAll('[class*="u-pull"] [class*="u-pull"]')
  .forEach(el => el.className = el.className.replace(/u-pull(-\w+)?/, 'n-pull$1'));

  if (typeof done === 'function') {
    done();
  }
};

module.exports = app;
