export type ResourceTypesResponse = {
  Resources: ResourceTypeSchema[];
  itemsPerPage: number;
  schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'];
  startIndex: number;
  totalResults: number;
};

export type ResourceTypeSchema = {
  id?: string; // same as name
  name: string;
  description: string;
  endpoint: string;
  schema: string;
  schemaExtensions?: { schema: string; required: boolean }[];
};

export type SchemaResponse = {
  Resources: Schema[];
  itemsPerPage: number;
  schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'];
  startIndex: number;
  totalResults: number;
};
export type Schema = {
  id: string; // URI of schema
  name?: string;
  description?: string;
  attributes: SchemaAttribute[];
};
export type SchemaAttribute = {
  name: string;
  type: "string" | "boolean" | "decimal" | "integer" | "dateTime" | "reference" | "complex",
  subAttributes?: SchemaAttribute[], // only if type is complex
  multiValued: boolean; 
  description: string;
  required: boolean;
  canonicalValue?: string[];
  caseExact: boolean;
  mutability: "readOnly" | "readWrite" | "immutable" | "writeOnly",
  returned: "always" | "never" | "default" | "request";
  uniqueness: "none" | "server" | "global"
  referenceTypes?: string[] // only if type is reference
}