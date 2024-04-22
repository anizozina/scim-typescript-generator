import axios, { AxiosError } from 'axios';
import { ResourceTypesResponse, Schema, SchemaResponse } from './types';

const baseUrl = 'https://api.slack.com/scim/v1';

const instance = axios.create({ baseURL: baseUrl });

export const loadSupportedResourceTypes = async () => {
  const response = await instance.get<ResourceTypesResponse>('ResourceTypes');
  return response.data;
};

export const loadSchema = async (): Promise<Schema[]> => {
  try {
    const response = await instance.get<SchemaResponse>('Schemas');
    console.log(`result: ${response.status}`);
    return response.data.Resources;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.log(`Axios error occurred. ${e.response?.status}`);
      if (e.response?.status === 404) {
        // retry each endpoints
        const result = await Promise.all([
          loadSpecificSchema('Users'),
          loadSpecificSchema('Roles'),
          loadSpecificSchema('Groups'),
        ]);
        console.log(result);
        return result.filter((r): r is Schema => !!r);
      }
    }
    throw e;
  }
};
const loadSpecificSchema = async (
  type: 'Users' | 'Roles' | 'Groups'
): Promise<Schema | undefined> => {
  try {
    const response = await instance.get<Schema>(`Schemas/${type}`);
    return response.data;
  } catch (e) {
    console.error(e);
    return;
  }
};
