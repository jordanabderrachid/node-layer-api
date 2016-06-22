/*globals describe it*/
'use strict';

var should = require('should');
var nock = require('nock');

var fixtures = require('./fixtures.json');
var utils = require('../lib/utils');

var LayerAPI = require('../lib');
var layerAPI = new LayerAPI({token: fixtures.token, appId: fixtures.appId});

describe('Conversation operations', function() {

  describe('Creating a conversation with participants', function() {
    nock('https://api.layer.com')
      .post('/apps/' + fixtures.appId + '/conversations')
      .times(3)
      .reply(201, fixtures.conversations.success);

    it('should return a conversation object', function(done) {
      var payload = {participants: fixtures.conversations.success.participants};
      layerAPI.conversations.create(payload, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(201);
        res.body.should.have.properties(fixtures.conversations.success);

        done(err);
      });
    });
    it('should return a conversation object - promise', function(done) {
      var payload = {participants: fixtures.conversations.success.participants};
      layerAPI.conversations.createAsync(payload).then(function(res) {
        should.exist(res);

        res.status.should.be.eql(201);
        res.body.should.have.properties(fixtures.conversations.success);

        done();
      }).catch(function(err) {
        should.not.exist(err);
        done(err);
      });
    });

    it('with dedupe should return a conversation object', function(done) {
      var payload = {participants: fixtures.conversations.success.participants};
      layerAPI.conversations.createDedupe(fixtures.appId, payload, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(201);
        res.body.should.have.properties(fixtures.conversations.success);

        done(err);
      });
    });

    it('with invalid dedupe value should return an error', function(done) {
      var payload = {participants: fixtures.conversations.success.participants};
      layerAPI.conversations.createDedupe('nonuuidvalue', payload, function(err, res) {
        should.exist(err);
        should.not.exist(res);

        err.message.should.be.eql(utils.i18n.dedupe);

        done();
      });
    });
  });

  describe('Creating a conversation with empty body', function() {
    nock('https://api.layer.com')
      .post('/apps/' + fixtures.appId + '/conversations')
      .reply(422, fixtures.conversations.error.missing);

    it('should return an error', function(done) {
      layerAPI.conversations.create({}, function(err, res) {
        should.exist(err);
        should.not.exist(res);

        err.status.should.be.eql(422);
        err.body.should.have.properties(fixtures.conversations.error.missing);

        done();
      });
    });
  });

  describe('Retrieving a conversation by conversation ID', function() {
    nock('https://api.layer.com')
      .get('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(200, fixtures.conversations.success);

    it('should return a conversation object', function(done) {
      layerAPI.conversations.get(fixtures.conversations.uuid, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(200);
        res.body.should.have.properties(fixtures.conversations.success);

        done(err);
      });
    });
  });

  describe('Retrieving a conversation by user ID and conversation ID', function() {
    nock('https://api.layer.com')
      .get('/apps/' + fixtures.appId + '/users/' + fixtures.conversations.userid + '/conversations/' + fixtures.conversations.uuid)
      .reply(200, fixtures.conversations.success);

    it('should return a conversation object', function(done) {
      layerAPI.conversations.getFromUser(fixtures.conversations.userid, fixtures.conversations.uuid, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(200);
        res.body.should.have.properties(fixtures.conversations.success);

        done(err);
      });
    });
  });

  describe('Retrieving all conversations by user ID', function() {
    nock('https://api.layer.com')
      .get('/apps/' + fixtures.appId + '/users/' + fixtures.conversations.userid + '/conversations')
      .reply(200, fixtures.conversations.success);

    it('should return a conversation object', function(done) {
      layerAPI.conversations.getAllFromUser(fixtures.conversations.userid, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(200);
        res.body.should.have.properties(fixtures.conversations.success);

        done(err);
      });
    });
  });

  describe('Retrieving all conversations by user ID with query parameters', function() {
    nock('https://api.layer.com')
      .get('/apps/' + fixtures.appId + '/users/' + fixtures.conversations.userid + '/conversations')
      .query({
        page_size: 50,
        from_id: fixtures.conversations.uuid,
        sort_by: 'last_message'
      })
      .reply(200, fixtures.conversations.success);

    it('should return a conversation object', function(done) {
      var params = {
        page_size: 50,
        from_id: fixtures.conversations.uuid,
        sort_by: 'last_message'
      };
      layerAPI.conversations.getAllFromUser(fixtures.conversations.userid, params, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(200);
        res.body.should.have.properties(fixtures.conversations.success);

        done(err);
      });
    });
  });

  describe('Editing a conversation by conversation ID', function() {
    nock('https://api.layer.com')
      .patch('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(204);

    var operations = [
      {operation: 'add', property: 'participants', value: 'user1'},
      {operation: 'remove', property: 'participants', value: 'user1'},
      {operation: 'set', property: 'participants', value: ['user1', 'user2', 'user3']}
    ];

    it('should return a 204', function(done) {
      layerAPI.conversations.edit(fixtures.conversations.uuid, operations, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(204);

        done(err);
      });
    });
  });

  describe('Set metadata properties on a conversation', function() {
    nock('https://api.layer.com')
      .patch('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(204);

    var properties = {
      foo: 'bar',
      number: 123
    };

    it('should return a 204', function(done) {
      layerAPI.conversations.setMetadataProperties(fixtures.conversations.uuid, properties, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(204);

        done(err);
      });
    });
  });

  describe('Delete metadata properties on a conversation', function() {
    nock('https://api.layer.com')
      .patch('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(204);

    var properties = {
      foo: 'bar',
      number: 123
    };

    it('should return a 204', function(done) {
      layerAPI.conversations.deleteMetadataProperties(fixtures.conversations.uuid, properties, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(204);

        done(err);
      });
    });
  });

  describe('Add participants on a conversation', function() {
    nock('https://api.layer.com')
      .patch('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(204);

    var participants = [
      'foo',
      'bar'
    ];

    it('should return a 204', function(done) {
      layerAPI.conversations.addParticipants(fixtures.conversations.uuid, participants, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(204);

        done(err);
      });
    });
  });

  describe('Remove participants on a conversation', function() {
    nock('https://api.layer.com')
      .patch('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(204);

    var participants = [
      'foo',
      'bar'
    ];

    it('should return a 204', function(done) {
      layerAPI.conversations.removeParticipants(fixtures.conversations.uuid, participants, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(204);

        done(err);
      });
    });
  });

  describe('Replace participants on a conversation', function() {
    nock('https://api.layer.com')
      .patch('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(204);

    var participants = [
      'foo',
      'bar'
    ];

    it('should return a 204', function(done) {
      layerAPI.conversations.replaceParticipants(fixtures.conversations.uuid, participants, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(204);

        done(err);
      });
    });
  });

  describe('Delete a conversation by conversation ID', function() {
    nock('https://api.layer.com')
      .delete('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(204);

    it('should return a 204', function(done) {
      layerAPI.conversations.delete(fixtures.conversations.uuid, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(204);

        done(err);
      });
    });
  });

  describe('Editing a conversation by passing invalid operations', function() {
    var operations = 'bla';

    it('should return an error', function(done) {
      layerAPI.conversations.edit(fixtures.conversations.uuid, operations, function(err, res) {
        should.exist(err);
        err.message.should.be.eql(utils.i18n.conversations.operations);
        should.not.exist(res);

        done();
      });
    });
  });

  describe('Retrieving a conversation by non-existent conversation ID', function() {
    nock('https://api.layer.com')
      .get('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid)
      .reply(404);

    it('should return 404', function(done) {
      layerAPI.conversations.get(fixtures.conversations.uuid, function(err, res) {
        should.exist(err);
        should.not.exist(res);

        err.status.should.be.eql(404);

        done();
      });
    });
  });

  describe('Creating a conversation by passing the wrong body', function() {
    it('should return an error', function(done) {
      layerAPI.conversations.create(123, function(err, res) {
        should.exist(err);
        err.message.should.be.eql(utils.i18n.conversations.body);
        should.not.exist(res);

        done();
      });
    });
  });

  describe('Retrieving a conversation by passing the wrong ID', function() {
    it('should return an error', function(done) {
      layerAPI.conversations.get(123, function(err, res) {
        should.exist(err);
        err.message.should.be.eql(utils.i18n.conversations.id);
        should.not.exist(res);

        done();
      });
    });
  });

  describe('Retrieving a conversation by passing the wrong ID', function() {
    it('should return an error', function(done) {
      layerAPI.conversations.get('bla-bla', function(err, res) {
        should.exist(err);
        err.message.should.be.eql(utils.i18n.conversations.id);
        should.not.exist(res);

        done();
      });
    });
  });

  describe('Initiate rich content upload', function() {
    nock('https://api.layer.com', {
      reqheaders: {
        'Upload-Content-Type': fixtures.conversations.contentType,
        'Upload-Origin': fixtures.conversations.contentOrigin,
        'Upload-Content-Length': fixtures.conversations.contentLength.toString()
      }
    })
    .post('/apps/' + fixtures.appId + '/conversations/' + fixtures.conversations.uuid + '/content')
    .reply(201, fixtures.conversations.content);

    it('should return a 201 and content', function(done) {
      layerAPI.conversations.initiateRichContent(fixtures.conversations.uuid, fixtures.conversations.contentType, fixtures.conversations.contentOrigin, fixtures.conversations.contentLength, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(201);
        res.body.should.have.properties(fixtures.conversations.content);

        done(err);
      });
    });
  });
});
