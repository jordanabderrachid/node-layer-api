/*globals describe it*/
'use strict';

var should = require('should');

var LayerAPI = require('../../lib');
var layerAPI = new LayerAPI({token: process.env.LAYER_TOKEN, appId: process.env.LAYER_APP_ID});

describe('Conversation operations', function() {

  var participants = ['test123', 'blabla'],
      conversationId = null;

  describe('Creating a conversation with participants', function() {
    it('should return a conversation object', function(done) {
      layerAPI.conversations.create({participants: participants}, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(201);
        res.body.participants.should.match(participants);

        conversationId = res.body.id;
        done(err);
      });
    });
  });

  describe('Creating a conversation with empty body', function() {
    it('should return an error', function(done) {
      layerAPI.conversations.create({}, function(err, res) {
        should.exist(err);
        should.not.exist(res);

        err.status.should.be.eql(422);
        err.body.should.have.properties({
          id: 'missing_property',
          code: 104,
          data: { property: 'participants' }
        });

        done();
      });
    });
  });

  describe('Retrieving a conversation by conversation ID', function() {
    it('should return a conversation object', function(done) {
      layerAPI.conversations.get(conversationId, function(err, res) {
        should.not.exist(err);
        should.exist(res);

        res.status.should.be.eql(200);
        res.body.participants.should.match(participants);

        done(err);
      });
    });
  });

  describe('Retrieving a conversation by non-existent conversation ID', function() {
    it('should return 404', function(done) {
      layerAPI.conversations.get('24f43c32-4d95-11e4-b3a2-0fd00000020d', function(err, res) {
        should.exist(err);
        should.not.exist(res);

        err.status.should.be.eql(404);
        err.body.should.have.properties({
          id: 'not_found',
          code: 102
        });

        done();
      });
    });
  });

  describe('Editing a conversation by conversation ID', function() {
    var operations = [
      {operation: 'add', property: 'participants', value: 'user1'},
      {operation: 'remove', property: 'participants', value: 'user1'},
      {operation: 'set', property: 'participants', value: ['user1', 'user2', 'user3']}
    ];

    it('should return a 204', function(done) {
      layerAPI.conversations.edit(conversationId, operations, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should(res.status).be.eql(204);
        should(res.body).be.eql('');

        done(err);
      });
    });
  });

  describe('Set metadata properties on a conversation', function() {
    var properties = {
      foo: 'bar',
      number: 123
    };

    it('should return a 204', function(done) {
      layerAPI.conversations.setMetadataProperties(conversationId, properties, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should(res.status).be.eql(204);
        should(res.body).be.eql('');

        done(err);
      });
    });
  });

  describe('Delete metadata properties on a conversation', function() {
    var properties = {
      foo: 'bar'
    };

    it('should return a 204', function(done) {
      layerAPI.conversations.deleteMetadataProperties(conversationId, properties, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should(res.status).be.eql(204);
        should(res.body).be.eql('');

        done(err);
      });
    });
  });

  describe('Add participants to a conversation', function() {
    var participants = [
      'userFoo',
      'userBar'
    ];

    it('should return a 204', function(done) {
      layerAPI.conversations.addParticipants(conversationId, participants, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should(res.status).be.eql(204);
        should(res.body).be.eql('');

        done(err);
      });
    });
  });

  describe('Remove participants to a conversation', function() {
    var participants = [
      'userFoo'
    ];

    it('should return a 204', function(done) {
      layerAPI.conversations.removeParticipants(conversationId, participants, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should(res.status).be.eql(204);
        should(res.body).be.eql('');

        done(err);
      });
    });
  });

  describe('Replace participants to a conversation', function() {
    var participants = [
      'userAdmin'
    ];

    it('should return a 204', function(done) {
      layerAPI.conversations.replaceParticipants(conversationId, participants, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should(res.status).be.eql(204);
        should(res.body).be.eql('');

        done(err);
      });
    });
  });

  describe('Delete a conversation by conversation ID', function() {
    it('should return a 204', function(done) {
      layerAPI.conversations.delete(conversationId, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should(res.status).be.eql(204);
        should(res.body).be.eql('');

        done(err);
      });
    });
  });

  decribe('Initiate a rich content upload', function() {
    var contentType = 'image/png';
    var contentOrigin = 'http://mydomain.com',
    var contentLength = 10001;

    it('should return a 201 and content', function(done) {
      layerAPI.conversations.initiateRichContent(conversationId, contentType, contentOrigin, contentLength, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        should(res.status).be.eql(201);
        res.body.should.have.ownProperty('id');
        res.body.should.have.ownProperty('size');
        res.body.should.have.ownProperty('upload_url');
        res.body.size.should.be.exactly(contentLength);

        done(err);
      });
    });
  });
});
