import * as jose from 'jose';
import { Options } from './BaseAuthApi';

const DEFAULT_CLOCK_TOLERANCE = 60; // secs

export class IdTokenValidatorError extends Error {}

interface ValidateOptions {
  nonce?: string;
  maxAge?: number;
  organization?: string;
}

export class IDTokenValidator {
  private jwks: (
    protectedHeader?: jose.JWSHeaderParameters | undefined,
    token?: jose.FlattenedJWSInput | undefined
  ) => Promise<jose.KeyLike>;
  private alg: string;
  private audience: string;
  private issuer: string;
  private clockTolerance: number;
  private secret: Uint8Array;

  constructor({
    domain,
    clientId,
    clientSecret,
    idTokenSigningAlg = 'RS256',
    clockTolerance = DEFAULT_CLOCK_TOLERANCE,
  }: Options) {
    this.jwks = jose.createRemoteJWKSet(new URL(`https://${domain}`));

    this.alg = idTokenSigningAlg;
    this.audience = clientId;
    this.secret = new TextEncoder().encode(clientSecret);
    this.issuer = `https://${domain}/`;
    this.clockTolerance = clockTolerance;
  }

  async validate(idToken: string, { nonce, maxAge, organization }: ValidateOptions) {
    const secret = this.alg === 'HS256' ? this.secret : this.jwks;
    const { protectedHeader: header, payload } = await jose.jwtVerify(idToken, secret as any, {
      issuer: this.issuer,
      audience: this.audience,
    });
    // Check algorithm
    if (header.alg !== this.alg) {
      throw new IdTokenValidatorError(
        `Signature algorithm of "${header.alg}" is not supported. Expected the ID token to be signed with "${this.alg}".`
      );
    }
    // Issuer
    if (!payload.iss || typeof payload.iss !== 'string') {
      throw new IdTokenValidatorError(
        'Issuer (iss) claim must be a string present in the ID token'
      );
    }
    if (payload.iss !== this.issuer) {
      throw new IdTokenValidatorError(
        `Issuer (iss) claim mismatch in the ID token; expected "${this.issuer}", found "${payload.iss}"`
      );
    }

    // Subject
    if (!payload.sub || typeof payload.sub !== 'string') {
      throw new IdTokenValidatorError(
        'Subject (sub) claim must be a string present in the ID token'
      );
    }

    // Audience
    if (!payload.aud || !(typeof payload.aud === 'string' || Array.isArray(payload.aud))) {
      throw new IdTokenValidatorError(
        'Audience (aud) claim must be a string or array of strings present in the ID token'
      );
    }
    if (Array.isArray(payload.aud) && !payload.aud.includes(this.audience)) {
      throw new IdTokenValidatorError(
        `Audience (aud) claim mismatch in the ID token; expected "${
          this.audience
        }" but was not one of "${payload.aud.join(', ')}"`
      );
    } else if (typeof payload.aud === 'string' && payload.aud !== this.audience) {
      throw new IdTokenValidatorError(
        `Audience (aud) claim mismatch in the ID token; expected "${this.audience}" but found "${payload.aud}"`
      );
    }

    // Organization
    if (organization) {
      if (!payload.org_id || typeof payload.org_id !== 'string') {
        throw new IdTokenValidatorError(
          'Organization Id (org_id) claim must be a string present in the ID token'
        );
      }

      if (payload.org_id !== organization) {
        throw new IdTokenValidatorError(
          `Organization Id (org_id) claim value mismatch in the ID token; expected "${organization}", found "${payload.org_id}"'`
        );
      }
    }

    // --Time validation (epoch)--
    const now = Math.floor(Date.now() / 1000);

    // Expires at
    if (!payload.exp || typeof payload.exp !== 'number') {
      throw new IdTokenValidatorError(
        'Expiration Time (exp) claim must be a number present in the ID token'
      );
    }
    const expTime = payload.exp + this.clockTolerance;

    if (now > expTime) {
      throw new IdTokenValidatorError(
        `Expiration Time (exp) claim error in the ID token; current time (${now}) is after expiration time (${expTime})`
      );
    }

    // Issued at
    if (!payload.iat || typeof payload.iat !== 'number') {
      throw new IdTokenValidatorError(
        'Issued At (iat) claim must be a number present in the ID token'
      );
    }

    // Nonce
    if (nonce) {
      if (!payload.nonce || typeof payload.nonce !== 'string') {
        throw new IdTokenValidatorError(
          'Nonce (nonce) claim must be a string present in the ID token'
        );
      }
      if (payload.nonce !== nonce) {
        throw new IdTokenValidatorError(
          `Nonce (nonce) claim mismatch in the ID token; expected "${nonce}", found "${payload.nonce}"`
        );
      }
    }

    // Authorized party
    if (Array.isArray(payload.aud) && payload.aud.length > 1) {
      if (!payload.azp || typeof payload.azp !== 'string') {
        throw new IdTokenValidatorError(
          'Authorized Party (azp) claim must be a string present in the ID token when Audience (aud) claim has multiple values'
        );
      }
      if (payload.azp !== this.audience) {
        throw new IdTokenValidatorError(
          `Authorized Party (azp) claim mismatch in the ID token; expected "${this.audience}", found "${payload.azp}"`
        );
      }
    }

    // Authentication time
    if (maxAge) {
      if (!payload.auth_time || typeof payload.auth_time !== 'number') {
        throw new IdTokenValidatorError(
          'Authentication Time (auth_time) claim must be a number present in the ID token when Max Age (max_age) is specified'
        );
      }

      const authValidUntil = payload.auth_time + maxAge + this.clockTolerance;
      if (now > authValidUntil) {
        throw new IdTokenValidatorError(
          `Authentication Time (auth_time) claim in the ID token indicates that too much time has passed since the last end-user authentication. Currrent time (${now}) is after last auth at ${authValidUntil}`
        );
      }
    }

    return payload;
  }
}
