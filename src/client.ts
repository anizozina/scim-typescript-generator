import axios, { AxiosError, AxiosInstance } from 'axios';
import { ResourceTypesResponse, Schema, SchemaResponse } from './types';

export class Client {
  #instance: AxiosInstance;
  private constructor(baseUrl: string) {
    this.#instance = axios.create({ baseURL: baseUrl });
  }
  static setup(baseUrl: string) {
    return new Client(baseUrl);
  }
  loadSupportedResourceTypes = async () => {
    const response =
      await this.#instance.get<ResourceTypesResponse>('ResourceTypes');
    return response.data;
  };

  loadSchema = async (): Promise<Schema[]> => {
    try {
      const response = await this.#instance.get<SchemaResponse>('Schemas');
      console.log(`result: ${response.status}`);
      return response.data.Resources;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.log(`Axios error occurred. ${e.response?.status}`);
        if (e.response?.status === 404) {
          // retry each endpoints
          const result = await Promise.all([
            this.#loadSpecificSchema('Users'),
            this.#loadSpecificSchema('Roles'),
            this.#loadSpecificSchema('Groups'),
          ]);
          console.log(result);
          return result.filter((r): r is Schema => !!r);
        }
      }
      throw e;
    }
  };
  #loadSpecificSchema = async (
    type: 'Users' | 'Roles' | 'Groups'
  ): Promise<Schema | undefined> => {
    try {
      const response = await this.#instance.get<Schema>(`Schemas/${type}`);
      return response.data;
    } catch (e) {
      console.error(e);
      return;
    }
  };
}
