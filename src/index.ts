import { Client } from './client';
import { exportCodeToFile } from './exporter';
import { applyCodeFormat } from './format';
import { generateSchemaTypes } from './typeGenerator';

(async () => {
  const schemas = await Client.setup('https://api.slack.com/scim/v1').loadSchema();
  const codes = await generateSchemaTypes(schemas);

  const formatCodes = await Promise.all(
    codes.map(async ({ name, code }) => ({
      name: name,
      code: await applyCodeFormat(code),
    }))
  );
  await exportCodeToFile(`./out`, formatCodes);
})();
