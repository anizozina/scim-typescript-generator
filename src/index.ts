import arg from 'arg';
import { argv, exit } from 'process';
import { Client } from './client';
import { exportCodeToFile } from './exporter';
import { applyCodeFormat } from './format';
import { generateSchemaTypes } from './typeGenerator';
const parse = () => {

  const args = arg(
    {
      '--help': Boolean,
      '--name': String,
      '--endpoint': String,
      '--output-folder': String,
  
      '-n': '--name',
      '-e': '--endpoint',
      '-o': '--output-folder',
    },
    { argv }
  );

  if(!args['--name']) {
    console.error('missing required parameter: name.')
    exit(1)
  }
  if(!args['--endpoint']) {
    console.error('missing required parameter: endpoint.')
    exit(1)
  }
  return {
    name: args['--name'],
    endpoint: args['--endpoint'],
    outDir: args['--output-folder'] ?? './out'
  }
}
// 'https://api.slack.com/scim/v1'
(async () => {
  const options = parse();
  const schemas = await Client.setup(
    options.endpoint
  ).loadSchema();
  const codes = await generateSchemaTypes(options.name, schemas);

  const formatCodes = await Promise.all(
    codes.map(async ({ name, code }) => ({
      name: name,
      code: await applyCodeFormat(code),
    }))
  );
  await exportCodeToFile(options.outDir, formatCodes);
})();
