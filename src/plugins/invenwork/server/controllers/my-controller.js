'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('invenwork')
      .service('myService')
      .getWelcomeMessage();
  },
});
