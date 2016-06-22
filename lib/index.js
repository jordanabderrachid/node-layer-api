'use strict';

var Promise = require('bluebird');

var pkg = require('../package.json');
var utils = require('./utils');

var Request = require('./request');

/**
 * Layer API constructor
 *
 * @class
 * @param  {Object} config Configuration values
 * @param  {String} config.token Layer Platform API token
 * @param  {String} config.appId Layer Application ID
 * @param  {String} [config.version] Platform API version
 * @param  {Number} [config.timeout] Request timeout in ms
 * @param  {Boolean} [config.debug] Display debug lines if set to true
 */
module.exports = function(config) {
  config = config || {};
  if (!config.token) throw new Error(utils.i18n.layerapi.token);
  config.appId = utils.toUUID(config.appId);
  if (!config.appId) throw new Error(utils.i18n.layerapi.appId);

  var request = new Request(config);

  this.conversations = Promise.promisifyAll(require('./resources/conversations')(request));
  this.messages = Promise.promisifyAll(require('./resources/messages')(request));
  this.announcements = Promise.promisifyAll(require('./resources/announcements')(request));
  this.blocklist = Promise.promisifyAll(require('./resources/blocklist')(request));
  this.identities = Promise.promisifyAll(require('./resources/identities')(request));

  process.env.LAYER_API_DEBUG = config.debug || false;
  utils.debug('Initialized v' + pkg.version + ' with appId: ' + config.appId);
};
