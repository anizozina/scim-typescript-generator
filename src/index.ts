import { loadSchema, loadSupportedResourceTypes } from './client';
import { exportCodeToFile } from './exporter';
import { applyCodeFormat } from './format';
import { generateSchemaTypes } from './generator';

(async () => {
  const resources = await loadSupportedResourceTypes();
  const schemas = await loadSchema();
  console.log(resources);
  const codes = await generateSchemaTypes(schemas);

  const formatCodes = await Promise.all(
    codes.map(async ({ name, code }) => ({
      name: name,
      code: await applyCodeFormat(code),
    }))
  );
  await exportCodeToFile(`./out`, formatCodes);
})();
