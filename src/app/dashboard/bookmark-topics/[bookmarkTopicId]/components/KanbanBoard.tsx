"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { BoardQuadrant, BoardContainer } from "./BoardQuadrant";
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
import type { Quadrant } from "./BoardQuadrant";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";

const defaultDndId = "kanban";

const QuadrantArrangementLiteral = {
  VERTICAL: "vertical",
  HORIZONTAL: "horizontal",
  GRID2x2: "grid2x2",
} as const;
type QuadrantArrangement =
  (typeof QuadrantArrangementLiteral)[keyof typeof QuadrantArrangementLiteral];

export function KanbanBoard({
  initialQuadrants,
  initialItems,
  quadrantArrangement,
  id = defaultDndId,
}: {
  initialQuadrants: Quadrant[];
  initialItems: Item[];
  quadrantArrangement: QuadrantArrangement;
  id?: string;
}) {
  const [quadrants, setQuadrants] = useState<Quadrant[]>(initialQuadrants);
  const pickedUpItemQuadrant = useRef<string | null>(null);
  const quadrantsId = useMemo(
    () => quadrants.map((quadrant) => quadrant.id),
    [quadrants],
  );

  const [items, setItems] = useState<Item[]>(initialItems);

  const [activeQuadrant, setActiveQuadrant] = useState<Quadrant | null>(null);

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

  function getDraggingItemData(itemId: UniqueIdentifier, quadrantId: string) {
    const itemsInQuadrant = items.filter(
      (item) => item.quadrantId === quadrantId,
    );
    const itemPosition = itemsInQuadrant.findIndex(
      (item) => item.id === itemId,
    );
    const quadrant = quadrants.find((quadrant) => quadrant.id === quadrantId);
    return {
      itemsInQuadrant: itemsInQuadrant,
      itemPosition,
      quadrant: quadrant,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Quadrant") {
        const startQuadrantIdx = quadrantsId.findIndex(
          (id) => id === active.id,
        );
        const startQuadrant = quadrants[startQuadrantIdx];
        return `Picked up Quadrant ${startQuadrant?.title} at position: ${
          startQuadrantIdx + 1
        } of ${quadrantsId.length}`;
      } else if (active.data.current?.type === "Item") {
        pickedUpItemQuadrant.current = active.data.current.item.quadrantId;
        const {
          itemsInQuadrant: itemsInQuadrant,
          itemPosition,
          quadrant: quadrant,
        } = getDraggingItemData(active.id, pickedUpItemQuadrant.current);
        return `Picked up Item ${
          active.data.current.item.content
        } at position: ${itemPosition + 1} of ${
          itemsInQuadrant.length
        } in quadrant ${quadrant?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "Quadrant" &&
        over.data.current?.type === "Quadrant"
      ) {
        const overQuadrantIdx = quadrantsId.findIndex((id) => id === over.id);
        return `Quadrant ${active.data.current.quadrant.title} was moved over ${
          over.data.current.quadrant.title
        } at position ${overQuadrantIdx + 1} of ${quadrantsId.length}`;
      } else if (
        active.data.current?.type === "Item" &&
        over.data.current?.type === "Item"
      ) {
        const {
          itemsInQuadrant: itemsInQuadrant,
          itemPosition,
          quadrant,
        } = getDraggingItemData(over.id, over.data.current.item.quadrantId);
        if (
          over.data.current.item.quadrantId !== pickedUpItemQuadrant.current
        ) {
          return `Item ${
            active.data.current.item.content
          } was moved over quadrant ${quadrant?.title} in position ${
            itemPosition + 1
          } of ${itemsInQuadrant.length}`;
        }
        return `Item was moved over position ${itemPosition + 1} of ${
          itemsInQuadrant.length
        } in quadrant ${quadrant?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpItemQuadrant.current = null;
        return;
      }
      if (
        active.data.current?.type === "Quadrant" &&
        over.data.current?.type === "Quadrant"
      ) {
        const overQuadrantPosition = quadrantsId.findIndex(
          (id) => id === over.id,
        );

        return `Quadrant ${
          active.data.current.quadrant.title
        } was dropped into position ${overQuadrantPosition + 1} of ${
          quadrantsId.length
        }`;
      } else if (
        active.data.current?.type === "Item" &&
        over.data.current?.type === "Item"
      ) {
        const {
          itemsInQuadrant: itemsInQuadrant,
          itemPosition,
          quadrant,
        } = getDraggingItemData(over.id, over.data.current.item.quadrantId);
        if (
          over.data.current.item.quadrantId !== pickedUpItemQuadrant.current
        ) {
          return `Item was dropped into quadrant ${quadrant?.title} in position ${
            itemPosition + 1
          } of ${itemsInQuadrant.length}`;
        }
        return `Item was dropped into position ${itemPosition + 1} of ${
          itemsInQuadrant.length
        } in quadrant ${quadrant?.title}`;
      }
      pickedUpItemQuadrant.current = null;
    },
    onDragCancel({ active }) {
      pickedUpItemQuadrant.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };
  const boardQuadrantArrangement =
    quadrantArrangement === QuadrantArrangementLiteral.HORIZONTAL
      ? "flex flex-row"
      : quadrantArrangement === QuadrantArrangementLiteral.VERTICAL
        ? "flex flex-col w-full h-full"
        : quadrantArrangement === QuadrantArrangementLiteral.GRID2x2
          ? "grid grid-cols-2 w-full h-full"
          : "flex flex-row";
  const quadrantGridRatio =
    quadrantArrangement === QuadrantArrangementLiteral.HORIZONTAL
      ? "hfull_w1/4"
      : quadrantArrangement === QuadrantArrangementLiteral.VERTICAL
        ? "h1/2_wfull"
        : quadrantArrangement === QuadrantArrangementLiteral.GRID2x2
          ? "h1/2_w1/2"
          : "hfull_w1/4";

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
        <SortableContext items={quadrantsId}>
          <div className={`${boardQuadrantArrangement} gap-2`}>
            {quadrants.map((quadrant) => (
              <BoardQuadrant
                key={quadrant.id}
                quadrant={quadrant}
                quadrantGridRatio={quadrantGridRatio}
                items={items.filter((item) => item.quadrantId === quadrant.id)}
              />
            ))}
          </div>
        </SortableContext>
      </BoardContainer>

      {mounted &&
        "document" in window &&
        createPortal(
          <DragOverlay>
            {activeQuadrant && (
              <BoardQuadrant
                isOverlay
                quadrant={activeQuadrant}
                items={items.filter(
                  (item) => item.quadrantId === activeQuadrant.id,
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
    if (data?.type === "Quadrant") {
      setActiveQuadrant(data.quadrant);
      return;
    }

    if (data?.type === "Item") {
      setActiveItem(data.item);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveQuadrant(null);
    setActiveItem(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAQuadrant = activeData?.type === "Quadrant";
    if (!isActiveAQuadrant) return;

    setQuadrants((quadrants) => {
      const activeQuadrantIndex = quadrants.findIndex(
        (quadrant) => quadrant.id === activeId,
      );

      const overQuadrantIndex = quadrants.findIndex(
        (quadrant) => quadrant.id === overId,
      );

      return arrayMove(quadrants, activeQuadrantIndex, overQuadrantIndex);
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
          activeItem.quadrantId !== overItem.quadrantId
        ) {
          activeItem.quadrantId = overItem.quadrantId;
          return arrayMove(items, activeIndex, overIndex - 1);
        }

        return arrayMove(items, activeIndex, overIndex);
      });
    }

    const isOverAQuadrant = overData?.type === "Quadrant";

    // Im dropping a Item over a quadrant
    if (isActiveAItem && isOverAQuadrant) {
      setItems((items) => {
        const activeIndex = items.findIndex((t) => t.id === activeId);
        const activeItem = items[activeIndex];
        if (activeItem) {
          activeItem.quadrantId = overId as string;
          return arrayMove(items, activeIndex, activeIndex);
        }
        return items;
      });
    }
  }
}
