import { loadSchema } from './client';
import { exportCodeToFile } from './exporter';
import { applyCodeFormat } from './format';
import { generateSchemaTypes } from './generator';

(async () => {
  const schemas = await loadSchema();
  const codes = await generateSchemaTypes(schemas);

  const formatCodes = await Promise.all(
    codes.map(async ({ name, code }) => ({
      name: name,
      code: await applyCodeFormat(code),
    }))
  );
  await exportCodeToFile(`./out`, formatCodes);
})();
