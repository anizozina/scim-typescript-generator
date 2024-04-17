import * as prettier from 'prettier';

export const applyCodeFormat = async (code: string): Promise<string> => {
  return prettier.format(code, { semi: false, parser: 'typescript' });
};
