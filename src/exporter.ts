import fs from 'node:fs/promises';

export const exportCodeToFile = async (
  path: string,
  codes: { name: string; code: string }[]
) => {
  const pathExists = await fs.access(path).then(
    () => true,
    () => false
  );
  if (!pathExists) {
    await fs.mkdir(path);
  }

  await Promise.all(
    codes.map(async ({ name, code }) =>
      fs.writeFile(`${path}/${name}.type.ts`, code)
    )
  );
};
