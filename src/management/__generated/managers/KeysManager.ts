import * as runtime from '../../runtime';
import type { InitOverride, ApiResponse } from '../../runtime';
import type {
  GetSigningKeys200ResponseInner,
  PostSigningKeys201Response,
  PutSigningKeys200Response,
} from '../models';

const { BaseAPI } = runtime;

export interface GetSigningKeyRequest {
  /**
   * Key id of the key to retrieve
   */
  kid: string;
}

export interface PutSigningKeysRequest {
  /**
   * Key id of the key to revoke
   */
  kid: string;
}

/**
 *
 */
export class KeysManager extends BaseAPI {
  /**
   * Get an Application Signing Key by its key id
   *
   * @throws {RequiredError}
   */
  async get(
    requestParameters: GetSigningKeyRequest,
    initOverrides?: InitOverride
  ): Promise<ApiResponse<GetSigningKeys200ResponseInner>> {
    runtime.validateRequiredRequestParams(requestParameters, ['kid']);

    const response = await this.request(
      {
        path: `/keys/signing/{kid}`.replace(
          '{kid}',
          encodeURIComponent(String(requestParameters.kid))
        ),
        method: 'GET',
      },
      initOverrides
    );

    return runtime.JSONApiResponse.fromResponse(response);
  }

  /**
   * Get all Application Signing Keys
   *
   * @throws {RequiredError}
   */
  async getAll(
    initOverrides?: InitOverride
  ): Promise<ApiResponse<Array<GetSigningKeys200ResponseInner>>> {
    const response = await this.request(
      {
        path: `/keys/signing`,
        method: 'GET',
      },
      initOverrides
    );

    return runtime.JSONApiResponse.fromResponse(response);
  }

  /**
   * Rotate the Application Signing Key
   *
   * @throws {RequiredError}
   */
  async rotate(initOverrides?: InitOverride): Promise<ApiResponse<PostSigningKeys201Response>> {
    const response = await this.request(
      {
        path: `/keys/signing/rotate`,
        method: 'POST',
      },
      initOverrides
    );

    return runtime.JSONApiResponse.fromResponse(response);
  }

  /**
   * Revoke an Application Signing Key by its key id
   *
   * @throws {RequiredError}
   */
  async revoke(
    requestParameters: PutSigningKeysRequest,
    initOverrides?: InitOverride
  ): Promise<ApiResponse<PutSigningKeys200Response>> {
    runtime.validateRequiredRequestParams(requestParameters, ['kid']);

    const response = await this.request(
      {
        path: `/keys/signing/{kid}/revoke`.replace(
          '{kid}',
          encodeURIComponent(String(requestParameters.kid))
        ),
        method: 'PUT',
      },
      initOverrides
    );

    return runtime.JSONApiResponse.fromResponse(response);
  }
}
