'use strict';
/**
 * Utilities
 * @module utils
 */

var util = require('util');

exports.UUID = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
exports.MIME_TEXT = 'text/plain';

exports.isArray = util.isArray;
exports.format = util.format;

exports.nop = function() {};

/**
 * Return a value only if UUID format
 *
 * @param  {String} val Input string
 */
exports.toUUID = function(val) {
  if (!val || typeof val !== 'string') return null;

  val = val.substr(val.lastIndexOf('/') + 1); // omit the prefix
  if (val.match(exports.UUID)) return val;
  else return null;
};

/**
 * Return a single plain text message body
 *
 * @param  {String} type   Sender type
 * @param  {String} sender Sender value
 * @param  {String} text   Message text
 */
exports.messageText = function(type, sender, text) {
  var body = {
    sender: {},
    parts: [
      {
        body: text,
        mime_type: exports.MIME_TEXT
      }
    ]
  };
  body.sender[type] = sender;
  return body;
};

/**
 * Debug function
 *
 * @param {String} val Text value to debug
 */
exports.debug = function(val) {
  if (process.env.LAYER_API_DEBUG !== 'true') return;
  console.log('[LayerAPI] ' + val);
};

/**
 * Error messages
 */
exports.i18n = {
  layerapi: {
    token: 'You need to pass a valid `token` to constructor',
    appId: 'You need to pass a valid `appId` to constructor',
    agent: 'Constructor option `agent` needs to be an instance of https.Agent'
  },
  conversations: {
    body: 'Conversation body is required',
    id: 'Conversation ID is required',
    userId: 'User ID is required',
    operations: 'Conversation operations should be array',
    participants: 'Array of participants is required',
    contentType: 'Content type is required',
    contentOrigin: 'Content origin is required',
    contentLength: 'Content length is required and must be strictly positive'
  },
  messages: {
    cid: 'Conversation ID is required',
    mid: 'Message ID is required',
    body: 'Message body is required',
    userId: 'User ID is required'
  },
  participants: {
    cid: 'Conversation ID is required',
    value: 'Participants value is required'
  },
  metadata: {
    cid: 'Conversation ID is required',
    property: 'Medatata property is required',
    value: 'Metadata value is required'
  },
  announcements: {
    body: 'Announcements body is required'
  },
  blocklist: {
    ownerId: 'Blocklist owner ID is required',
    userId: 'Blocklist user ID is required'
  },
  identities: {
    id: 'User ID is required',
    displayName: 'The display_name property is required'
  },
  dedupe: 'De-duplicating UUID value is required'
};
