import type { Active, DataRef, Over } from "@dnd-kit/core";
import type { ColumnDragData } from "./BoardColumn";
import type { ItemDragData } from "./ItemCard";

type DraggableData = ColumnDragData | ItemDragData;

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Item") {
    return true;
  }

  return false;
}
