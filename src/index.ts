import { loadSchema, loadSupportedResourceTypes } from './client';
import { generateSchemaTypes } from './generator';

(async () => {
  const resources = await loadSupportedResourceTypes();
  const schemas = await loadSchema();
  console.log(resources);
  await generateSchemaTypes(schemas);
})();
