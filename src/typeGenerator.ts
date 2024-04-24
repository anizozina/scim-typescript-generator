import { Schema, SchemaAttribute } from './types';

const toPascalCase = (name: string) => {
  const [first, ...rest] = name;
  return `${first.toUpperCase()}${rest.join('')}`;
};

const toType = (
  attribute: SchemaAttribute,
  filter: (a: SchemaAttribute) => boolean
) => {
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
      return `{${toProperty(subAttributes, filter)}}`;
    }
  }
};

const toProperty = (
  attributes: SchemaAttribute[],
  filter: (a: SchemaAttribute) => boolean
): string => {
  return attributes
    .filter(filter)
    .map((attribute) => {
      const { name, required, multiValued } = attribute;
      const type = toType(attribute, filter);

      return `"${name}"${required ? '' : '?'}: ${type}${
        multiValued ? '[]' : ''
      };`;
    })
    .join('\n');
};
const generateType = (name: string, attributes: SchemaAttribute[]) => {
  const result = `export type ${toPascalCase(name)} = {
    ${toProperty(attributes, () => true)}
}`;
  return result;
};

export const generateSchemaTypes = (systemName: string, schemas: Schema[]) => {
  const codes = schemas.map((resource) => {
    const { name, attributes } = resource;
    const schemaName = toPascalCase(`${systemName}${toPascalCase(name ?? resource.id.split(':').pop()!)}`);
    return {
      name: schemaName,
      code: [
        generateType(schemaName, attributes),
        generateResponseType(schemaName, attributes),
        generatePayloadType(schemaName, attributes),
      ].join('\n\n'),
    };
  });
  return codes;
};

const generateResponseType = (name: string, attributes: SchemaAttribute[]) => {
  const result = `export type ${toPascalCase(name)}Response = {
    ${toProperty(attributes, (att) => {
      if(!att.mutability) return true;
      return !!att.mutability.match(/.*[r|R]ead.*/);
    })}
}`;
  return result;
};
const generatePayloadType = (name: string, attributes: SchemaAttribute[]) => {
  const result = `export type ${toPascalCase(name)}Payload = {
    ${toProperty(attributes, (att) => {
      if(!att.mutability) return true;
      return !!att.mutability.match(/.*[w|W]rite.*/);
    })}
}`;
  return result;
};
