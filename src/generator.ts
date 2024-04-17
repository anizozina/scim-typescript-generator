import { SchemaAttribute, SchemaResponse } from './types';

const toPascalCase = (name: string) => {
  const [first, ...rest] = name;
  return `${first.toUpperCase()}${rest.join('')}`;
};

// 最初に必要なtypeを全部作っちゃってから型の名前突っ込むようにしますか。
const findComplexType = (attributes: SchemaAttribute[]) => {
  const result: { name: string; attributes: SchemaAttribute[] }[] = [];
  attributes.forEach((attribute) => {
    if (attribute.type === 'complex') {
      const subAttributes = attribute.subAttributes;
      result.push({ name: attribute.name, attributes: subAttributes! });
      result.push(...findComplexType(subAttributes!));
    }
  });
  return result;
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
    case 'complex':
      return toPascalCase(attribute.name);
  }
};

const convertToParam = (name: string, attributes: SchemaAttribute[]) => {
  return `export type ${toPascalCase(name)} = {
    ${attributes
      .map((attribute) => {
        const { name, required, multiValued } = attribute;
        const type = toType(attribute);
        return `${name}${required ? '' : '?'}: ${type}${
          multiValued ? '[]' : ''
        };`;
      })
      .join('\n')}
}
`;
};

const generateType = (name: string, attributes: SchemaAttribute[]) => {
  const complexType = findComplexType(attributes);
  const types = complexType.map(({ name, attributes }) =>
    convertToParam(name, attributes)
  );
  const result = `${types.join('')}
${convertToParam(name, attributes)}`;
  return result;
};

export const generateSchemaTypes = (schema: SchemaResponse) => {
  const codes = schema.Resources.map((resource) => {
    const { name, attributes } = resource;
    const schemaName = name ?? resource.id.split(':').pop()!;
    return { name: schemaName, code: generateType(schemaName, attributes) };
  });
  return codes;
};
