import { Schema, SchemaAttribute } from './types';

const toPascalCase = (name: string) => {
  const [first, ...rest] = name;
  return `${first.toUpperCase()}${rest.join('')}`;
};

const toType = (attribute: SchemaAttribute) => {
  const type = attribute.type;
  switch (type) {
    case 'string':
    case 'boolean':
      return type;
    case 'decimal':
    case 'integer':
      return 'number';
    case 'dateTime':
      return 'Date';
    case 'reference':
      return attribute.referenceTypes; // どう変換したものか...。
    case 'complex': {
      const subAttributes: SchemaAttribute[] = (() => {
        const propertyName = (() => {
          if ('subAttributes' in attribute) {
            return 'subAttributes';
            // for group in user schema in slack
          } else if ('subattributes' in attribute) {
            return 'subattributes';
          }
          return '';
        })();
        const value = attribute[propertyName as 'subAttributes'];
        if (!value) return [];
        if (Array.isArray(value)) {
          return value;
        }
        return [value];
      })();
      return `{${toProperty(subAttributes)}}`;
    }
  }
};

const toProperty = (attributes: SchemaAttribute[]): string => {
  return attributes
    .map((attribute) => {
      const { name, required, multiValued } = attribute;
      const type = toType(attribute);

      return `"${name}"${required ? '' : '?'}: ${type}${
        multiValued ? '[]' : ''
      };`;
    })
    .join('\n');
};

const convertToParam = (name: string, attributes: SchemaAttribute[]) => {
  return `export type ${toPascalCase(name)} = {
    ${toProperty(attributes)}
}
`;
};

const generateType = (name: string, attributes: SchemaAttribute[]) => {
  const result = `
${convertToParam(name, attributes)}`;
  return result;
};

export const generateSchemaTypes = (schemas: Schema[]) => {
  const codes = schemas.map((resource) => {
    const { name, attributes } = resource;
    const schemaName = name ?? resource.id.split(':').pop()!;
    return { name: schemaName, code: generateType(schemaName, attributes) };
  });
  return codes;
};
