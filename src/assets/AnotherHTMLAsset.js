const HTMLAsset = require('parcel-bundler/src/assets/HTMLAsset');

// A list of all attributes that may produce a dependency
// Based on https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
const ATTRS = {
  src: [
    'script',
    'img',
    'audio',
    'video',
    'source',
    'track',
    'iframe',
    'embed'
  ],
  'data-src': [
    'script',
    'img',
    'audio',
    'video',
    'source',
    'track',
    'iframe',
    'embed'
  ],
  href: ['link', 'a'],
  poster: ['video'],
  'xlink:href': ['use', 'image'],
  content: ['meta']
};

// A list of metadata that should produce a dependency
// Based on:
// - http://schema.org/
// - http://ogp.me
// - https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup
// - https://msdn.microsoft.com/en-us/library/dn255024.aspx
const META = {
  property: [
    'og:image',
    'og:image:url',
    'og:image:secure_url',
    'og:audio',
    'og:audio:secure_url',
    'og:video',
    'og:video:secure_url'
  ],
  name: [
    'twitter:image',
    'msapplication-square150x150logo',
    'msapplication-square310x310logo',
    'msapplication-square70x70logo',
    'msapplication-wide310x150logo',
    'msapplication-TileImage'
  ],
  itemprop: [
    'image',
    'logo',
    'screenshot',
    'thumbnailUrl',
    'contentUrl',
    'downloadUrl'
  ]
};

class AnotherHTMLAsset extends HTMLAsset {
  collectDependencies() {
    this.ast.walk(node => {
      if (node.attrs) {
        if (node.tag === 'meta') {
          if (
            !Object.keys(node.attrs).some(attr => {
              let values = META[attr];
              return values && values.includes(node.attrs[attr]);
            })
          ) {
            return node;
          }
        }

        for (let attr in node.attrs) {
          if (node.tag === 'img' && attr === 'srcset') {
            node.attrs[attr] = this.collectSrcSetDependencies(node.attrs[attr]);
            this.isAstDirty = true;
            continue;
          }
          let elements = ATTRS[attr];
          // Check for virtual paths
          if (node.tag === 'a' && node.attrs[attr].lastIndexOf('.') < 1) {
            continue;
          }
          if (elements && elements.includes(node.tag)) {
            node.attrs[attr] = this.processSingleDependency(node.attrs[attr]);
            this.isAstDirty = true;
          }
        }
      }

      return node;
    });
  }
}

module.exports = AnotherHTMLAsset;
