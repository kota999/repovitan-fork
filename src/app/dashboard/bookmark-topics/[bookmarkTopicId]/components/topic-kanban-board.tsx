"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { BoardQuadrant, BoardContainer } from "./board-quadrant";
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
import { type Item, ItemCard } from "./item-card";
import type { Quadrant } from "./board-quadrant";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { saveQuadrantItemsAction } from "../actions";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

const defaultDndId = "kanban";

const QuadrantArrangementLiteral = {
  VERTICAL: "vertical",
  HORIZONTAL: "horizontal",
  GRID2x2: "grid2x2",
} as const;
type QuadrantArrangement =
  (typeof QuadrantArrangementLiteral)[keyof typeof QuadrantArrangementLiteral];

export const InboxQuadrantInfo: Quadrant = {
  id: "q-1", // System用のダミーID(未登録アイテムボックス)
  title: "Inbox",
} as const;
export const MemoQuadrantInfo: Quadrant = {
  id: "q-2", // System用のダミーID(メモ作成用ボックス)
  title: "Memo",
} as const;
const SystemQuadrants: Quadrant[] = [
  // TODO: q-1, q-2のシステム用の象限に対する操作をブロックする。今は操作したら何が起きるか分からない。
  InboxQuadrantInfo,
  MemoQuadrantInfo,
] as const;

export function TopicKanbanBoard({
  topicId,
  topicName,
  initialQuadrants,
  initialItems,
  quadrantArrangement,
  id = defaultDndId,
  share = false,
}: {
  topicId: string;
  topicName: string;
  initialQuadrants: Quadrant[];
  initialItems: Item[];
  quadrantArrangement: QuadrantArrangement;
  id?: string;
  share?: boolean;
}) {
  const [isHorizontal, setIsHorizontal] = useState<boolean>(false);
  const [hiddenInboxAndMemo, setHiddenInboxAndMemo] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  const makeQuadrants = hiddenInboxAndMemo
    ? [...initialQuadrants]
    : [...initialQuadrants, ...SystemQuadrants];
  const [quadrants, setQuadrants] = useState<Quadrant[]>(makeQuadrants);
  const quadrantsId = useMemo(
    () => quadrants.map((quadrant) => quadrant.id),
    [quadrants],
  );
  const pickedUpItemQuadrant = useRef<string | null>(null);

  const [items, setItems] = useState<Item[]>(initialItems);
  const [activeQuadrant, setActiveQuadrant] = useState<Quadrant | null>(null);
  const [activeItem, setActiveItem] = useState<Item | null>(null);

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
          active.data.current.item.type === "bookmark"
            ? active.data.current.item.content.title
            : active.data.current.item.content.content // memo
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
            active.data.current.item.type === "bookmark"
              ? active.data.current.item.content.title
              : active.data.current.item.content.content // memo
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
      // Move Quadrant
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
        // Move Item
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
          ? "h-full w-full grid grid-cols-2"
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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-between relative flex flex-row gap-2">
        <div className="text-xl font-bold">{topicName}</div>
        <div className="ml-auto flex flex-row space-x-2">
          <div className="flex items-center gap-1">
            <Switch
              id="is-horizontal"
              defaultChecked={isHorizontal}
              onCheckedChange={(checked) => setIsHorizontal(checked)}
            />
            <Label htmlFor="is-horizontal">Horizontal</Label>
          </div>
          <div className="flex items-center gap-1">
            <Switch
              id="hidden-inbox-and-memo"
              defaultChecked={hiddenInboxAndMemo}
              onCheckedChange={(checked) => {
                if (checked) {
                  setQuadrants(
                    quadrants.filter(
                      (quadrant) =>
                        !SystemQuadrants.map((q) => q.id).includes(quadrant.id),
                    ),
                  );
                } else {
                  setQuadrants([...quadrants, ...SystemQuadrants]);
                }
                setHiddenInboxAndMemo(checked);
              }}
            />
            <Label htmlFor="hidden-inbox-and-memo">Hidden Inbox and Memo</Label>
          </div>
        </div>
      </div>
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
            <div className="flex flex-col gap-2">
              <div className={`${boardQuadrantArrangement} gap-2`}>
                {quadrants.map((quadrant) => (
                  <BoardQuadrant
                    key={quadrant.id}
                    topicId={topicId}
                    quadrant={quadrant}
                    quadrantGridRatio={quadrantGridRatio}
                    cardOrientation={isHorizontal ? "horizontal" : "vertical"}
                    items={items.filter(
                      (item) =>
                        //普通の象限に属するアイテム
                        item.quadrantId === quadrant.id ||
                        //普通の象限に属しないアイテム
                        (!quadrants
                          .slice(0, -SystemQuadrants.length)
                          .find((q) => q.id === item.quadrantId) &&
                          ((item.type === "bookmark" &&
                            quadrant.id === InboxQuadrantInfo.id) || // BookmarkはInboxの象限
                            (item.type === "memo" &&
                              quadrant.id === MemoQuadrantInfo.id))), // MemoはMemoの象限
                    )}
                    updateQuadrantTitleState={updateQuadrantTitle}
                    addMemoState={addMemoState}
                    share={share}
                  />
                ))}
              </div>
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
                  topicId={topicId}
                  quadrant={activeQuadrant}
                  items={items.filter(
                    (item) => item.quadrantId === activeQuadrant.id,
                  )}
                  updateQuadrantTitleState={updateQuadrantTitle}
                  addMemoState={addMemoState}
                  cardOrientation={isHorizontal ? "horizontal" : "vertical"}
                />
              )}
              {activeItem && <ItemCard item={activeItem} isOverlay />}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </div>
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

  async function onDragOver(event: DragOverEvent) {
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

    // TODO: memoへの対応
    async function saveItemsActionFunc(saveItems: Item[]) {
      // 2x2の象限に決め撃ち
      const quadrantsToItems = [0, 1, 2, 3].map((i) => ({
        quadrantId: (initialQuadrants[i]?.id ?? "") as string,
        items: saveItems
          .filter((item) => item.quadrantId === initialQuadrants[i]?.id)
          .map((item) => ({ itemId: item.id as string, itemType: item.type })),
      }));
      await saveQuadrantItemsAction(quadrantsToItems);
    }
    // Im dropping a Item over another Item
    if (isActiveAItem && isOverAItem) {
      const activeIndex = items.findIndex((t) => t.id === activeId);
      const overIndex = items.findIndex((t) => t.id === overId);
      const activeItem = items[activeIndex];
      const overItem = items[overIndex];
      const makeSaveItems = () => {
        if (
          activeItem &&
          overItem &&
          activeItem.quadrantId !== overItem.quadrantId
        ) {
          activeItem.quadrantId = overItem.quadrantId;
          return arrayMove(items, activeIndex, overIndex - 1);
        }
        return arrayMove(items, activeIndex, overIndex);
      };
      const newItems = makeSaveItems();
      await saveItemsActionFunc(newItems);
      setItems(newItems);
    }

    const isOverAQuadrant = overData?.type === "Quadrant";

    // Im dropping a Item over a quadrant
    if (isActiveAItem && isOverAQuadrant) {
      const makeSaveItems = () => {
        const activeIndex = items.findIndex((t) => t.id === activeId);
        const activeItem = items[activeIndex];
        if (activeItem) {
          activeItem.quadrantId = overId as string;
          return arrayMove(items, activeIndex, activeIndex);
        }
        return items;
      };
      const newItems = makeSaveItems();
      await saveItemsActionFunc(newItems);
      setItems(newItems);
    }
  }

  function updateQuadrantTitle(quadrantId: string, title: string) {
    setQuadrants(
      quadrants.map((quadrant) => ({
        id: quadrant.id,
        title: quadrant.id === quadrantId ? title : quadrant.title,
      })),
    );
  }

  function addMemoState(memoId: string, memo: string) {
    setItems([
      ...items,
      {
        id: memoId,
        quadrantId: "",
        type: "memo",
        content: {
          content: memo,
        },
      },
    ]);
  }
}
