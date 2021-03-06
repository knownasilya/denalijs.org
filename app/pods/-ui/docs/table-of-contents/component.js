import { kebabCase } from 'lodash';
import Component from '@ember/component';
import { run } from '@ember/runloop';
import { computed } from '@ember/object';

export default Component.extend({

  tagName: 'nav',
  classNames: [ 'table-of-contents' ],

  entries: computed('text', function() {
    let headerRegex = /^(#{1,6})\s+(.+)$/gm;
    let text = this.get('text');
    let results;
    let headers = [];
    // eslint-disable-next-line no-cond-assign
    while((results = headerRegex.exec(text)) !== null) {
      let [ , headerLevel, headerText ] = results;
      headers.push({
        level: headerLevel.length,
        title: headerText,
        slug: kebabCase(headerText).replace(/[^A-z0-9]/g, '')
      });
    }
    return { children: headers };
  }),

  didInsertElement() {
    run.next(() => {
      let headers = this.$(document).find('h1,h2,h3,h4,h5,h6,[data-toc-anchor]');
      this.$(document).on('scroll.toc-scrollspy', () => {
        let scroll = this.$(document).scrollTop();
        let threshold = scroll + 100;
        let candidate;
        headers.each((i, el) => {
          let position = this.$(el).offset().top;
          if (position < threshold) {
            candidate = el;
          } else {
            return false;
          }
        });
        if (!candidate) {
          return;
        }
        this.set('tocPosition', candidate.id);
      });

      if (window.location.hash) {
        this.send('scrollToTarget', window.location.hash.slice(1));
      }
    });
  },

  willDestroyElement() {
    this.$(document).off('scroll.toc-scrollspy');
  },

  findHeaderForSlug(slug) {
    return this.$(document).find(`#${ slug }`);
  },

  updateURL(slug) {
    let newURL = `${ window.location.pathname.split('#')[0] }#${ slug }`;
    history.replaceState(slug, slug, newURL);
  },

  actions: {
    scrollToTarget(slug) {
      this.updateURL(slug);
      this.findHeaderForSlug(slug).velocity('scroll', {
        duration: 400,
        easing: [250, 30]
      });
    }
  }

})