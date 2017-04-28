// External
const cn = require('classnames');
const html = require('bel');
const url2cmid = require('util-url2cmid');

// Ours
const {IS_PREVIEW} = require('../../../constants');
const {before, detach, prepend, select, selectAll} = require('../../../utils');
const Caption = require('../Caption');
const VideoPlayer = require('../VideoPlayer');

const SCROLLPLAY_PCT_PATTERN = /scrollplay(\d+)/;

function VideoEmbed({
  videoId,
  captionEl,
  isAmbient,
  isAutoplay,
  isFullscreen,
  isLoop,
  isMuted,
  scrollplayPct
}) {
  if (isAmbient) {
    isFullscreen = true;
  }

  const className = cn('VideoEmbed', {
    'u-pull': !isFullscreen,
    'u-full': isFullscreen
  });

  const videoEmbedEl = html`
    <div class="${className}">
      ${captionEl}
    </div>
  `;

  VideoPlayer.getMetadata(videoId, (err, metadata) => {
    if (err) {
      if (IS_PREVIEW) {
        prepend(videoEmbedEl, html`
          <div class="VideoEmbed-unpublished">
            ${err.message}
          </div>
        `);
      }
    
      return;
    }

    prepend(videoEmbedEl, VideoPlayer(Object.assign(metadata, {
      isAmbient,
      isAutoplay,
      isFullscreen,
      isLoop,
      isMuted,
      scrollplayPct,
    })));
  });

  return videoEmbedEl;
};

function transformEl(el) {
  const videoId = url2cmid(select('a', el).getAttribute('href'));
  const prevElName = (el.previousElementSibling && el.previousElementSibling.getAttribute('name')) || '';
  const suffix = (prevElName.indexOf('video') === 0 && prevElName.slice(5)) || '';
  const [, scrollplayPctString] = suffix.match(SCROLLPLAY_PCT_PATTERN) || [, ''];

  if (videoId) {
    const videoEmbedEl = VideoEmbed({
      videoId,
      captionEl: Caption.createFromEl(el),
      isAmbient: suffix.indexOf('ambient') > -1,
      isAutoplay: suffix.indexOf('autoplay') > -1,
      isFullscreen: suffix.indexOf('fullscreen') > -1,
      isLoop: suffix.indexOf('loop') > -1,
      isMuted: suffix.indexOf('muted') > -1,
      scrollplayPct: scrollplayPctString.length > 0 &&
        Math.max(0, Math.min(100, +scrollplayPctString))
    });

    before(el, videoEmbedEl);
    detach(el);
  }
}

module.exports = VideoEmbed;
module.exports.transformEl = transformEl;