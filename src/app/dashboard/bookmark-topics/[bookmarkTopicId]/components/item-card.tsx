"use client";

import type { DraggableAttributes, UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ItemTypeBookmark = "bookmark";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ItemTypeMemo = "memo";

export type ItemContentType = typeof ItemTypeBookmark | typeof ItemTypeMemo;
export type Item = {
  id: UniqueIdentifier;
  quadrantId: string;
} & (
  | {
      type: typeof ItemTypeBookmark;
      content: {
        title: string;
        description: string;
        imageUrl: string;
        bookmarksToTags: {
          tag: { id: string; name: string };
        }[];
      };
    }
  | {
      type: typeof ItemTypeMemo;
      content: {
        content: string;
      };
    }
);

interface ItemCardProps {
  item: Item;
  isOverlay?: boolean;
  direction?: "vertical" | "horizontal";
}

export type ItemDropableType = "Item";

export interface ItemDragData {
  type: ItemDropableType;
  item: Item;
}

export function ItemCard({
  item,
  isOverlay,
  direction = "horizontal",
}: ItemCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "Item",
      item: item,
    } satisfies ItemDragData,
    attributes: {
      roleDescription: "Item",
    },
  });

  const style = {
    transition,

    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })} ${direction === "horizontal" ? "w-full" : "w-64"}`}
    >
      {
        /* header */
        direction === "horizontal" ? (
          ""
        ) : (
          <CardHeader className="border-b-2 border-secondary p-0">
            <div className="space-between relative flex flex-row px-0.5 py-0.5">
              {getGripButton(attributes, listeners)}
              <span className="line-clamp-1 text-xs">
                {item.type === "bookmark" ? item.content.title : "memo"}
              </span>
            </div>
          </CardHeader>
        )
      }
      {
        /* content & footer */
        direction === "horizontal" ? (
          <div className="space-between relative flex flex-row">
            {getGripButton(attributes, listeners)}
            {item.type === "bookmark" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.content.imageUrl}
                alt="avatar"
                key={item.id}
                className="h-20"
              />
            ) : (
              ""
            )}
            <div className="flex flex-col">
              <CardContent className="p-0 text-left">
                <div className="space-between relative flex flex-row px-0.5 py-0.5">
                  {item.type === "bookmark" ? (
                    <Button
                      variant="ghost"
                      className="h-full w-full justify-start whitespace-pre-wrap px-1 py-1"
                    >
                      <a
                        href={`/dashboard/bookmarks/${item.id}`}
                        className="text-left"
                      >
                        <p className="text-xs">{item.content.title}</p>
                      </a>
                    </Button>
                  ) : (
                    <div className="h-auto w-full justify-start whitespace-pre-wrap px-1 py-1">
                      <div className="text-xs">{item.content.content}</div>
                    </div>
                  )}
                </div>
              </CardContent>
              {getCardDescription(item, true)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <CardContent className="p-0 text-left">
              {item.type === "bookmark" ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.content.imageUrl}
                    alt="avatar"
                    key={item.id}
                    className="w-full"
                  />
                  <span className="text-s line-clamp-1 px-2">
                    {item.content.title}
                  </span>
                </div>
              ) : (
                <div className="min-h-40">
                  <span className="line-clamp-6 px-2 py-1 text-xs">
                    {item.content.content}
                  </span>
                </div>
              )}
            </CardContent>
            {getCardDescription(item, false)}
          </div>
        )
      }
    </Card>
  );
}

const getGripButton = (
  attributes: DraggableAttributes,
  listeners?: SyntheticListenerMap,
) => {
  return (
    <Button
      variant={"ghost"}
      {...attributes}
      {...listeners}
      className="h-auto cursor-grab px-2 py-0.5 text-secondary-foreground/50"
    >
      <span className="sr-only">Move item</span>
      <GripVertical />
    </Button>
  );
};

const getCardDescription = (item: Item, showItemType: boolean) => {
  return (
    <CardDescription className="mt-auto flex gap-1 px-3 pb-0.5 text-xs">
      {showItemType ? <span>{item.type}</span> : ""}
      {
        item.type === "bookmark"
          ? item.content.bookmarksToTags.map(({ tag: { id, name } }) => (
              <span key={id}>#{name}</span>
            )) // bookmark
          : "" // memo
      }
    </CardDescription>
  );
};
