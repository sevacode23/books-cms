import { AttributeValue } from '@aws-sdk/client-dynamodb';

/** Map DynamoDB item to TypeScript object */
export const parseDynamoDBItem = <T extends Record<string, unknown>>(
  item: Record<string, AttributeValue>,
): T => {
  // Initialize parsed item with partial type of TypeScript object
  const parsedItem: Partial<T> = {};

  for (const key of Object.keys(item)) {
    const value = item[key];

    // if value is S convert to string
    if (value.S !== undefined) {
      parsedItem[key as keyof T] = value.S as T[keyof T];
      // if value is N convert to number
    } else if (value.N !== undefined) {
      parsedItem[key as keyof T] = Number(value.N) as T[keyof T];
      // if value is BOOL convert to boolean
    } else if (value.BOOL !== undefined) {
      parsedItem[key as keyof T] = value.BOOL as T[keyof T];
      // if value is L recursively convert to array
    } else if (value.L !== undefined) {
      parsedItem[key as keyof T] = value.L.map((v) =>
        parseDynamoDBItem<Record<string, unknown>>(
          v as unknown as Record<string, AttributeValue>,
        ),
      ) as T[keyof T];
    } else if (value.M !== undefined) {
      // if value is M recursively convert to object
      parsedItem[key as keyof T] = parseDynamoDBItem<Record<string, unknown>>(
        value.M,
      ) as T[keyof T];
    }
  }

  return parsedItem as T;
};

/** Map DynamoDB items to TypeScript objects */
export const parseDynamoDBItems = <T extends Record<string, unknown>>(
  items: Record<string, AttributeValue>[],
): T[] => items.map(parseDynamoDBItem<T>);
