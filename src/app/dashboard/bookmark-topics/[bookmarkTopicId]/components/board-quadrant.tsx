"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDndContext, type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { type Item, ItemCard } from "./item-card";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { GripVertical } from "lucide-react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { EditableTitle } from "./editable-title";
import { ItemFilterForm } from "./item-filter-form";
import { InboxQuadrantInfo, MemoQuadrantInfo } from "./topic-kanban-board";
import { AddMemoDialog } from "./add-memo-dialog";

const DragQuadrantIsEnable = false;

export interface Quadrant {
  id: UniqueIdentifier;
  title: string;
}

export type QuadrantDropableType = "Quadrant";

export interface QuadrantDragData {
  type: QuadrantDropableType;
  quadrant: Quadrant;
}

interface BoardQuadrantProps {
  topicId: string;
  quadrant: Quadrant;
  items: Item[];
  quadrantGridRatio?: "hfull_w1/4" | "h1/2_wfull" | "h1/2_w1/2";
  isOverlay?: boolean;
  cardOrientation?: "vertical" | "horizontal";
  updateQuadrantTitleState: (quadrantId: string, title: string) => void;
  addMemoState: (topicId: string, memo: string) => void;
}

export function BoardQuadrant({
  topicId,
  quadrant,
  items,
  quadrantGridRatio = "hfull_w1/4",
  isOverlay,
  cardOrientation = "vertical",
  updateQuadrantTitleState,
  addMemoState,
}: BoardQuadrantProps) {
  // filterKeywordはInboxのみで設定する
  const [itemFilterKeyword, setItemFilterKeyword] = useState("");
  const viewItems =
    itemFilterKeyword === ""
      ? items
      : items.filter(
          (item) =>
            item.type === "bookmark"
              ? item.content.title.includes(itemFilterKeyword) ||
                item.content.description.includes(itemFilterKeyword)
              : item.content.content.includes(itemFilterKeyword), // memo
        );
  const viewItemsIds = useMemo(() => {
    return viewItems.map((item) => item.id);
  }, [viewItems]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: quadrant.id,
    data: {
      type: "Quadrant",
      quadrant: quadrant,
    } satisfies QuadrantDragData,
    attributes: {
      roleDescription: `Quadrant: ${quadrant.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };
  // TODO: 現在は完全にPC用レイアウト。
  const hxw =
    quadrantGridRatio === "hfull_w1/4"
      ? "h-[620px] w-1/2"
      : quadrantGridRatio === "h1/2_wfull"
        ? "h-[310px] w-full"
        : quadrantGridRatio === "h1/2_w1/2"
          ? "h-[310px] w-full"
          : "h-[620px] w-1/4";
  const variants = cva(
    `max-h-[620px] max-w-full ${hxw} bg-primary-foreground flex flex-col flex-shrink-0 snap-center`,
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    },
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="space-between flex flex-row items-center space-y-0 border-b-2 p-4 text-left font-semibold">
        {DragQuadrantIsEnable ? (
          <Button
            variant="ghost"
            {...attributes}
            {...listeners}
            className="relative -ml-2 h-auto cursor-grab p-1 text-primary/50"
          >
            <span className="sr-only">{`Move quadrant: ${quadrant.title}`}</span>
            <GripVertical />
          </Button>
        ) : (
          ""
        )}
        {quadrant.id === InboxQuadrantInfo.id ? (
          <div className="w-auto pl-2">
            <ItemFilterForm
              itemFilterKeyword={itemFilterKeyword}
              handleInputChange={(newValue: string) => {
                setItemFilterKeyword(newValue);
              }}
            />
          </div>
        ) : (
          ""
        )}
        {quadrant.id === MemoQuadrantInfo.id ? (
          <>
            <AddMemoDialog topicId={topicId} addMemoState={addMemoState} />
          </>
        ) : (
          ""
        )}
        <div className="ml-auto p-1">
          <EditableTitle
            quadrantId={quadrant.id as string}
            title={quadrant.title}
            updateQuadrantTitleState={updateQuadrantTitleState}
          />
        </div>
      </CardHeader>
      <ScrollArea>
        <CardContent
          className={`flex flex-grow ${cardOrientation === "vertical" ? "flex-col" : "flex-row"} gap-2 p-2`}
        >
          <SortableContext items={viewItemsIds}>
            {viewItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                direction={
                  cardOrientation === "vertical" ? "horizontal" : "vertical"
                }
              />
            ))}
          </SortableContext>
        </CardContent>
        <ScrollBar orientation={cardOrientation} />
      </ScrollArea>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva("px-2 md:px-0 flex lg:justify-center pb-4", {
    variants: {
      dragging: {
        default: "snap-x snap-mandatory",
        active: "snap-none",
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}
    >
      <div className="items-center justify-center gap-4">{children}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
