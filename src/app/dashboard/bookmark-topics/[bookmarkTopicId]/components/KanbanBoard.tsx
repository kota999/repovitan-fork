"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { BoardColumn, BoardContainer } from "./BoardColumn";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  type Announcements,
  type UniqueIdentifier,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { type Item, ItemCard } from "./ItemCard";
import type { Column } from "./BoardColumn";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";

const defaultDndId = "kanban";

export function KanbanBoard({
  cols,
  initialItems,
  id = defaultDndId,
}: {
  cols: Column[];
  initialItems: Item[];
  id?: string;
}) {
  const [columns, setColumns] = useState<Column[]>(cols);
  const pickedUpItemColumn = useRef<string | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [items, setItems] = useState<Item[]>(initialItems);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    }),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  function getDraggingItemData(itemId: UniqueIdentifier, columnId: string) {
    const itemsInColumn = items.filter((item) => item.columnId === columnId);
    const itemPosition = itemsInColumn.findIndex((item) => item.id === itemId);
    const column = columns.find((col) => col.id === columnId);
    return {
      itemsInColumn,
      itemPosition,
      column,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Column") {
        const startColumnIdx = columnsId.findIndex((id) => id === active.id);
        const startColumn = columns[startColumnIdx];
        return `Picked up Column ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${columnsId.length}`;
      } else if (active.data.current?.type === "Item") {
        pickedUpItemColumn.current = active.data.current.item.columnId;
        const { itemsInColumn, itemPosition, column } = getDraggingItemData(
          active.id,
          pickedUpItemColumn.current,
        );
        return `Picked up Item ${
          active.data.current.item.content
        } at position: ${itemPosition + 1} of ${
          itemsInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnIdx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overColumnIdx + 1} of ${columnsId.length}`;
      } else if (
        active.data.current?.type === "Item" &&
        over.data.current?.type === "Item"
      ) {
        const { itemsInColumn, itemPosition, column } = getDraggingItemData(
          over.id,
          over.data.current.item.columnId,
        );
        if (over.data.current.item.columnId !== pickedUpItemColumn.current) {
          return `Item ${
            active.data.current.item.content
          } was moved over column ${column?.title} in position ${
            itemPosition + 1
          } of ${itemsInColumn.length}`;
        }
        return `Item was moved over position ${itemPosition + 1} of ${
          itemsInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpItemColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`;
      } else if (
        active.data.current?.type === "Item" &&
        over.data.current?.type === "Item"
      ) {
        const { itemsInColumn, itemPosition, column } = getDraggingItemData(
          over.id,
          over.data.current.item.columnId,
        );
        if (over.data.current.item.columnId !== pickedUpItemColumn.current) {
          return `Item was dropped into column ${column?.title} in position ${
            itemPosition + 1
          } of ${itemsInColumn.length}`;
        }
        return `Item was dropped into position ${itemPosition + 1} of ${
          itemsInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpItemColumn.current = null;
    },
    onDragCancel({ active }) {
      pickedUpItemColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  return (
    <DndContext
      accessibility={{
        announcements,
      }}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      id={id}
    >
      <BoardContainer>
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              items={items.filter((item) => item.columnId === col.id)}
            />
          ))}
        </SortableContext>
      </BoardContainer>

      {mounted &&
        "document" in window &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                isOverlay
                column={activeColumn}
                items={items.filter(
                  (item) => item.columnId === activeColumn.id,
                )}
              />
            )}
            {activeItem && <ItemCard item={activeItem} isOverlay />}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Item") {
      setActiveItem(data.item);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveItem(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveAItem = activeData?.type === "Item";
    const isOverAItem = overData?.type === "Item";

    if (!isActiveAItem) return;

    // Im dropping a Item over another Item
    if (isActiveAItem && isOverAItem) {
      setItems((items) => {
        const activeIndex = items.findIndex((t) => t.id === activeId);
        const overIndex = items.findIndex((t) => t.id === overId);
        const activeItem = items[activeIndex];
        const overItem = items[overIndex];
        if (
          activeItem &&
          overItem &&
          activeItem.columnId !== overItem.columnId
        ) {
          activeItem.columnId = overItem.columnId;
          return arrayMove(items, activeIndex, overIndex - 1);
        }

        return arrayMove(items, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Item over a column
    if (isActiveAItem && isOverAColumn) {
      setItems((items) => {
        const activeIndex = items.findIndex((t) => t.id === activeId);
        const activeItem = items[activeIndex];
        if (activeItem) {
          activeItem.columnId = overId as string;
          return arrayMove(items, activeIndex, activeIndex);
        }
        return items;
      });
    }
  }
}
