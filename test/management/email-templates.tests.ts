import chai from 'chai';
import nock from 'nock';

const API_URL = 'https://tenant.auth0.com/api/v2';

import {
  EmailTemplatesManager,
  GetEmailTemplatesByTemplateNameTemplateNameEnum,
} from '../../src/management/__generated/index';
import { ManagementClient } from '../../src/management';

const { expect } = chai;

const TEMPLATE_NAME = GetEmailTemplatesByTemplateNameTemplateNameEnum.reset_email;
const DEFAULT_PARAMS = { templateName: TEMPLATE_NAME };
const DEFAULT_DATA = {
  template: GetEmailTemplatesByTemplateNameTemplateNameEnum.verify_email,
  body: '',
  from: 'sender@auth0.com',
  resultUrl: '',
  subject: '',
  syntax: 'liquid',
  urlLifetimeInSeconds: 0,
  enabled: false,
};

describe('EmailTemplatesManager', () => {
  let emailTemplates: EmailTemplatesManager;
  const token = 'TOKEN';

  before(function () {
    const client = new ManagementClient({
      domain: 'tenant.auth0.com',
      token: token,
    });
    emailTemplates = client.emailTemplates;
  });
  describe('instance', () => {
    const methods = ['get', 'create', 'update'];

    methods.forEach((method) => {
      it(`should have a ${method} method`, function () {
        expect((emailTemplates as any)[method]).to.exist.to.be.an.instanceOf(Function);
      });
    });
  });

  describe('#constructor', () => {
    it('should throw an error when no base URL is provided', () => {
      expect(() => {
        new EmailTemplatesManager({} as any);
      }).to.throw(Error, 'Must provide a base URL for the API');
    });

    it('should throw an error when the base URL is invalid', () => {
      expect(() => {
        new EmailTemplatesManager({ baseUrl: '' } as any);
      }).to.throw(Error, 'The provided base URL is invalid');
    });
  });

  describe('#get', () => {
    let request: nock.Scope;

    beforeEach(function () {
      request = nock(API_URL).get(`/email-templates/${TEMPLATE_NAME}`).reply(200, DEFAULT_DATA);
    });

    it('should return a promise if no callback is given', function (done) {
      emailTemplates.get(DEFAULT_PARAMS).then(done.bind(null, null)).catch(done.bind(null, null));
    });

    it(`should perform a GET request to /api/v2/email-templates/${TEMPLATE_NAME}`, function (done) {
      emailTemplates.get(DEFAULT_PARAMS).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });

    it('should pass any errors to the promise catch handler', function (done) {
      nock.cleanAll();

      nock(API_URL).get(`/email-templates/${TEMPLATE_NAME}`).reply(500);

      emailTemplates.get(DEFAULT_PARAMS).catch((err) => {
        expect(err).to.exist;

        done();
      });
    });

    it('should include the token in the Authorization header', function (done) {
      nock.cleanAll();

      const request = nock(API_URL)
        .get(`/email-templates/${TEMPLATE_NAME}`)
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(200, {});

      emailTemplates.get(DEFAULT_PARAMS).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });
  });

  describe('#create', () => {
    let request: nock.Scope;

    beforeEach(function () {
      request = nock(API_URL).post('/email-templates').reply(200, {});
    });

    it('should return a promise if no callback is given', function (done) {
      emailTemplates.create(DEFAULT_DATA).then(done.bind(null, null)).catch(done.bind(null, null));
    });

    it('should pass any errors to the promise catch handler', function (done) {
      nock.cleanAll();

      nock(API_URL).post('/email-templates').reply(500);

      emailTemplates.create(DEFAULT_DATA).catch((err) => {
        expect(err).to.exist;

        done();
      });
    });

    it('should perform a POST request to /api/v2/email-templates', function (done) {
      emailTemplates.create(DEFAULT_DATA).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });

    it('should pass the data in the body of the request', function (done) {
      nock.cleanAll();

      const request = nock(API_URL).post('/email-templates', DEFAULT_DATA).reply(200, {});

      emailTemplates.create(DEFAULT_DATA).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });

    it('should include the token in the Authorization header', function (done) {
      nock.cleanAll();

      const request = nock(API_URL)
        .post('/email-templates')
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(200, {});

      emailTemplates.create(DEFAULT_DATA).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });
  });

  describe('#update', () => {
    const patchData = { from: 'new@email.com' };
    let request: nock.Scope;

    beforeEach(function () {
      request = nock(API_URL).patch(`/email-templates/${TEMPLATE_NAME}`).reply(200, DEFAULT_DATA);
    });

    it('should return a promise if no callback is given', function (done) {
      emailTemplates
        .update(DEFAULT_PARAMS, {})
        .then(done.bind(null, null))
        .catch(done.bind(null, null));
    });

    it(`should perform a PATCH request to /api/v2/email-templates/${TEMPLATE_NAME}`, function (done) {
      emailTemplates.update(DEFAULT_PARAMS, {}).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });

    it('should include the new data in the body of the request', function (done) {
      nock.cleanAll();

      const request = nock(API_URL)
        .patch(`/email-templates/${TEMPLATE_NAME}`, patchData)
        .reply(200, {});

      emailTemplates.update(DEFAULT_PARAMS, patchData).then(() => {
        expect(request.isDone()).to.be.true;

        done();
      });
    });

    it('should pass any errors to the promise catch handler', function (done) {
      nock.cleanAll();

      nock(API_URL).patch(`/email-templates/${TEMPLATE_NAME}`).reply(500);

      emailTemplates.update(DEFAULT_PARAMS, patchData).catch((err) => {
        expect(err).to.exist;

        done();
      });
    });
  });
});
