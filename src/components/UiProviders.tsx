import {
  CategoriesTreeComponent,
  ModelsTreeComponent,
  ModelsTreeNodeType,
  TreeDefinition,
  TreeRenderProps,
  TreeWidgetOptions,
  TreeWidgetUiItemsProvider,
} from "@itwin/tree-widget-react";
import { SelectionMode } from "@itwin/components-react";

const FEATURE_USAGE_PREFIX = "tree-widget";

function getTreeWidgetOptions(): TreeWidgetOptions {
  const trees: TreeDefinition[] = [
    {
      id: ModelsTreeComponent.id,
      getLabel: ModelsTreeComponent.getLabel,
      render: (treeProps: TreeRenderProps) => (
        <ModelsTreeComponent
          {...treeProps}
          hierarchyLevelConfig={{ isFilteringEnabled: true }}
          selectionMode={SelectionMode.Extended}
          selectionPredicate={(_key, type) =>
            type === ModelsTreeNodeType.Element
          }
        />
      ),
    },
    {
      id: CategoriesTreeComponent.id,
      getLabel: CategoriesTreeComponent.getLabel,
      render: (treeProps: TreeRenderProps) => (
        <CategoriesTreeComponent {...treeProps} />
      ),
    },
  ];

  return {
    defaultTreeWidgetPriority: -1,
    onPerformanceMeasured: (feature, elapsedTime) => {
      console.log(`${FEATURE_USAGE_PREFIX}:${feature}`, elapsedTime);
    },
    trees,
  };
}

export function createTreeWidgetUiItemsProvider() {
  return new TreeWidgetUiItemsProvider(getTreeWidgetOptions());
}
