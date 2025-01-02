import type { Active, DataRef, Over } from "@dnd-kit/core";
import type { QuadrantDragData } from "./board-quadrant";
import type { ItemDragData } from "./item-card";

type DraggableData = QuadrantDragData | ItemDragData;

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Quadrant" || data?.type === "Item") {
    return true;
  }

  return false;
}
