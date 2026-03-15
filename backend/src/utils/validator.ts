export interface SchemaField {
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  allowed_values?: any[];
}

export type InputSchema = Record<string, SchemaField>;

export const validateInput = (schema: any, data: any) => {
  if (!schema || typeof schema !== 'object') return { valid: true, errors: [] };

  const inputSchema = schema as InputSchema;
  const errors: string[] = [];

  for (const [key, field] of Object.entries(inputSchema)) {
    const value = data[key];

    // Check required
    if (field.required && (value === undefined || value === null)) {
      errors.push(`Field '${key}' is required`);
      continue;
    }

    if (value !== undefined && value !== null) {
      // Check type
      if (typeof value !== field.type) {
        errors.push(`Field '${key}' must be of type ${field.type}`);
      }

      // Check allowed_values
      if (field.allowed_values && !field.allowed_values.includes(value)) {
        errors.push(`Field '${key}' has invalid value. Allowed: ${field.allowed_values.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
