'use strict';
/**
 * Conversations resource
 * @module resources/conversations
 */

var querystring = require('querystring');

var utils = require('../utils');

module.exports = function(request) {
  return {

    /**
     * Create conversation
     *
     * @param  {Object}   body      Conversation body
     * @param  {Function} callback  Callback function
     */
    create: create.bind(null, null),

    /**
     * Create conversation with de-duplicating UUID
     *
     * @param  {String}   dedupe    UUID
     * @param  {Object}   body      Conversation body
     * @param  {Function} callback  Callback function
     */
    createDedupe: create,

    /**
     * Retrieve a conversation
     *
     * @param  {String}   conversationId  Conversation ID
     * @param  {Function} callback        Callback function
     */
    get: function(conversationId, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      utils.debug('Conversation get: ' + conversationId);

      request.get({
        path: '/conversations/' + conversationId
      }, callback);
    },

    /**
     * Retrieve a conversation from user
     *
     * @param  {String}   userId          User ID
     * @param  {String}   conversationId  Conversation ID
     * @param  {Function} callback        Callback function
     */
    getFromUser: function(userId, conversationId, callback) {
      if (!userId) return callback(new Error(utils.i18n.conversations.userId));
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      utils.debug('Conversation getFromUser: ' + userId + ', ' + conversationId);

      request.get({
        path: '/users/' + querystring.escape(userId) + '/conversations/' + conversationId
      }, callback);
    },

    /**
     * Retrieve all conversations from user
     *
     * @param  {String}   userId      User ID
     * @param  {String}   [params]    Query parameters
     * @param  {Function} callback    Callback function
     */
    getAllFromUser: function(userId, params, callback) {
      if (!userId) return callback(new Error(utils.i18n.conversations.userId));
      utils.debug('Conversation getAllFromUser: ' + userId);

      var queryParams = '';
      if (typeof params === 'function') callback = params;
      else queryParams = '?' + querystring.stringify(params);

      request.get({
        path: '/users/' + querystring.escape(userId) + '/conversations' + queryParams
      }, callback);
    },

    /**
     * Edit a conversation
     *
     * @param  {String}   conversationId Conversation UUID
     * @param  {Array}    operations      Array of operations
     * @param  {Function} callback        Callback function
     */
    edit: function(conversationId, operations, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      if (!utils.isArray(operations)) return callback(new Error(utils.i18n.conversations.operations));
      utils.debug('Conversation edit: ' + conversationId);

      edit(conversationId, operations, callback);
    },

    /**
     * Set metadata on a conversation
     *
     * @param  {String}   conversationId  Conversation UUID
     * @param  {Object}   properties      Properties object
     * @param  {Function} callback        Callback function
     */
    setMetadataProperties: function(conversationId, properties, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      utils.debug('Conversation setMetadataProperties: ' + conversationId);

      var operations = [];
      Object.keys(properties).forEach(function(name) {
        var fullName = name;
        if (name !== 'metadata' && name.indexOf('metadata.') !== 0) {
          fullName = 'metadata.' + name;
        }
        operations.push({
          operation: 'set',
          property: fullName,
          value: String(properties[name]),
        });
      });
      edit(conversationId, operations, callback);
    },

    /**
     * Delete metadata on a conversation
     *
     * @param  {String}   conversationId  Conversation UUID
     * @param  {Object}   properties      Properties object
     * @param  {Function} callback        Callback function
     */
    deleteMetadataProperties: function(conversationId, properties, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      utils.debug('Conversation deleteMetadataProperties: ' + conversationId);

      var operations = [];
      Object.keys(properties).forEach(function(property) {
        if (property !== 'metadata' && property.indexOf('metadata.') !== 0) {
          property = 'metadata.' + property;
        }
        operations.push({
          operation: 'delete',
          property: property,
        });
      });

      edit(conversationId, operations, callback);
    },

    /**
     * Participants add/remove/set operations on a conversation
     *
     * @param  {String}   conversationId  Conversation UUID
     * @param  {Object}   participants    Array of participant IDs
     * @param  {Function} callback        Callback function
     */
    addParticipants: function(conversationId, participants, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      if (!utils.isArray(participants)) return callback(new Error(utils.i18n.conversations.participants));
      utils.debug('Conversation addParticipants: ' + conversationId);

      var operations = participants.map(function(participant) {
        return {
          operation: 'add',
          property: 'participants',
          value: participant
        };
      });

      edit(conversationId, operations, callback);
    },
    removeParticipants: function(conversationId, participants, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      if (!utils.isArray(participants)) return callback(new Error(utils.i18n.conversations.participants));
      utils.debug('Conversation removeParticipants: ' + conversationId);

      var operations = participants.map(function(participant) {
        return {
          operation: 'remove',
          property: 'participants',
          value: participant
        };
      });

      edit(conversationId, operations, callback);
    },
    replaceParticipants: function(conversationId, participants, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      if (!utils.isArray(participants)) return callback(new Error(utils.i18n.conversations.participants));
      utils.debug('Conversation replaceParticipants: ' + conversationId);

      var operations = {
        operation: 'set',
        property: 'participants',
        value: participants
      };

      edit(conversationId, [operations], callback);
    },

    /**
     * Delete a conversation
     *
     * @param  {String}   conversationId Conversation UUID
     * @param  {Function} callback        Callback function
     */
    delete: function(conversationId, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      utils.debug('Conversation delete: ' + conversationId);

      request.delete({
        path: '/conversations/' + conversationId
      }, callback || utils.nop);
    },

    /**
     * Initiate a rich content upload
     *
     * @param  {String}   conversationId Conversation UUID
     * @param  {String}   contentType    Mime type for the content to be uploaded (ex: "image/png")
     * @param  {String}   contentOrigin  Value of the "Origin" header of the future upload request (ex: "http://mydomain.com")
     * @param  {Number}   contentLength  Size of the content to be uploaded, must be strictly positive (ex: 10001)
     * @param  {Function} callback       Callback function
     */
    initiateRichContent: function(conversationId, contentType, contentOrigin, contentLength, callback) {
      conversationId = utils.toUUID(conversationId);
      if (!conversationId) return callback(new Error(utils.i18n.conversations.id));
      if (!contentType || typeof contentType !== 'string') return callback(new Error(utils.i18n.conversations.contentType));
      if (!contentOrigin || typeof contentOrigin !== 'string') return callback(new Error(utils.i18n.conversations.contentOrigin));
      if (typeof contentLength !== 'number' || contentLength < 1) return callback(new Error(utils.i18n.conversations.contentLength));

      utils.debug('Conversation initiateRichContent: ' + conversationId);
      utils.debug(utils.format('Conversation initiateRichContent: contentType="%s", contentLength=%d', contentType, contentLength));

      request.post({
        path: '/conversations/' + conversationId + '/content',
        headers: {
          'Upload-Content-Type': contentType,
          'Upload-Origin': contentOrigin,
          'Upload-Content-Length': contentLength.toString()
        }
      }, callback || utils.nop);
    }
  };

  function create(dedupe, body, callback) {
    if (dedupe !== null && !utils.toUUID(dedupe)) return callback(new Error(utils.i18n.dedupe));
    if (!body || typeof body !== 'object') return callback(new Error(utils.i18n.conversations.body));
    utils.debug('Conversation create');

    request.post({
      path: '/conversations',
      body: body,
      dedupe: dedupe
    }, callback || utils.nop);
  }

  function edit(conversationId, operations, callback) {
    request.patch({
      path: '/conversations/' + conversationId,
      body: operations
    }, callback || utils.nop);
  }
};
