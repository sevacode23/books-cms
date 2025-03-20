import { GraphQLResolveInfo, Kind, SelectionNode } from 'graphql';

export const getSelectedFields = (info: GraphQLResolveInfo): string[] => {
  const fields: string[] = [];

  const extractFields = (selections: readonly SelectionNode[], prefix = '') => {
    selections.forEach((selection) => {
      if (selection.kind === Kind.FIELD) {
        const fieldName = selection.name.value;
        fields.push(`${prefix}${fieldName}`);

        if (selection.selectionSet) {
          extractFields(
            selection.selectionSet.selections,
            `${prefix}${fieldName}.`,
          );
        }
      }
    });
  };

  extractFields(info.fieldNodes[0].selectionSet?.selections || []);

  return fields;
};
