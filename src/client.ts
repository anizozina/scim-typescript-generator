import axios from 'axios';
import { ResourceTypesResponse, SchemaResponse } from './types';

const baseUrl = 'http://localhost:8080';

const instance = axios.create({ baseURL: baseUrl });

export const loadSupportedResourceTypes = async () => {
  const response = await instance.get<ResourceTypesResponse>(
    'scim/ResourceTypes'
  );
  return response.data;
};

export const loadSchema = async () => {
  const response = await instance.get<SchemaResponse>('scim/Schemas');
  return response.data;
};
