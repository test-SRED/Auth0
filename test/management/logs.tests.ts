import chai from 'chai';
import nock from 'nock';

const API_URL = 'https://tenant.auth0.com/api/v2';

import {
  LogsManager,
  PatchProviderRequestNameEnum,
  PostProviderRequestNameEnum,
} from '../../src/management/__generated/index';
import { ManagementClient } from '../../src/management';

const { expect } = chai;

describe('LogsManager', () => {
  let logs: LogsManager;
  const token = 'TOKEN';

  before(function () {
    const client = new ManagementClient({
      domain: 'tenant.auth0.com',
      token: token,
    });
    logs = client.logs;
  });

  describe('instance', () => {
    const methods = ['getAll', 'get'];

    methods.forEach((method) => {
      it(`should have a ${method} method`, function () {
        expect((logs as any)[method]).to.exist.to.be.an.instanceOf(Function);
      });
    });
  });

  describe('#constructor', () => {
    it('should throw an error when no base URL is provided', () => {
      expect(() => {
        new LogsManager({} as any);
      }).to.throw(Error, 'Must provide a base URL for the API');
    });

    it('should throw an error when the base URL is invalid', () => {
      expect(() => {
        new LogsManager({ baseUrl: '' } as any);
      }).to.throw(Error, 'The provided base URL is invalid');
    });
  });

  describe('#getAll', () => {
    let request: nock.Scope;

    beforeEach(function () {
      request = nock(API_URL).get('/logs').reply(200, []);
    });

    it('should return a promise if no callback is given', function (done) {
      logs.getAll().then(done.bind(null, null)).catch(done.bind(null, null));
    });

    it('should pass any errors to the promise catch handler', function (done) {
      nock.cleanAll();

      nock(API_URL).get('/logs').reply(500);

      logs.getAll().catch((err) => {
        expect(err).to.exist;

        done();
      });
    });

    it('should pass the body of the response to the "then" handler', function (done) {
      nock.cleanAll();

      const data = [{ audience: '123' }];
      nock(API_URL).get('/logs').reply(200, data);

      logs.getAll().then((logs) => {
        expect(logs.data).to.be.an.instanceOf(Array);

        expect(logs.data.length).to.equal(data.length);

        expect(logs.data[0].audience).to.equal(data[0].audience);

        done();
      });
    });

    it('should perform a GET request to /api/v2/logs', function (done) {
      logs.getAll().then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });

    it('should include the token in the Authorization header', function (done) {
      nock.cleanAll();

      const request = nock(API_URL)
        .get('/logs')
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(200, []);

      logs.getAll().then(() => {
        expect(request.isDone()).to.be.true;
        done();
      });
    });

    it('should pass the parameters in the query-string', function (done) {
      nock.cleanAll();

      const request = nock(API_URL)
        .get('/logs')
        .query({
          include_fields: true,
          fields: 'test',
        })
        .reply(200, []);

      logs.getAll({ include_fields: true, fields: 'test' }).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });
  });

  describe('#get', () => {
    const params = { id: '5' };
    const data = {
      id: params.id,
      name: 'Test log',
    };
    let request: nock.Scope;

    beforeEach(function () {
      request = nock(API_URL).get(`/logs/${data.id}`).reply(200, {});
    });

    it('should return a promise if no callback is given', function (done) {
      logs.get(params).then(done.bind(null, null)).catch(done.bind(null, null));
    });

    it('should pass any errors to the promise catch handler', function (done) {
      nock.cleanAll();

      nock(API_URL).get(`/logs/${params.id}`).reply(500);

      logs.get(params).catch((err) => {
        expect(err).to.exist;

        done();
      });
    });

    it('should pass the body of the response to the "then" handler', function (done) {
      nock.cleanAll();

      nock(API_URL).get(`/logs/${params.id}`).reply(200, data);

      logs.get(params).then((log) => {
        expect(log.data.id).to.equal(data.id);

        done();
      });
    });

    it('should perform a GET request to /api/v2/logs/:id', function (done) {
      logs.get(params).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });

    it('should include the token in the Authorization header', function (done) {
      nock.cleanAll();

      const request = nock(API_URL)
        .get('/logs')
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(200, {});

      logs.getAll().then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });

    it('should pass the parameters in the query-string', function (done) {
      nock.cleanAll();

      const request = nock(API_URL)
        .get('/logs')
        .query({
          include_fields: true,
          fields: 'test',
        })
        .reply(200, {});

      logs.getAll({ include_fields: true, fields: 'test' }).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });
  });
});
