"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
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
import { Badge } from "~/components/ui/badge";

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
}

export type ItemDropableType = "Item";

export interface ItemDragData {
  type: ItemDropableType;
  item: Item;
}

export function ItemCard({ item, isOverlay }: ItemCardProps) {
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
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="border-b-2 border-secondary p-0">
        <div className="space-between relative flex flex-row px-0.5 py-0.5">
          <Button
            variant={"ghost"}
            {...attributes}
            {...listeners}
            className="h-auto cursor-grab px-2 py-0.5 text-secondary-foreground/50"
          >
            <span className="sr-only">Move item</span>
            <GripVertical />
          </Button>
          {item.type === "bookmark" ? (
            // bookmark
            <Button
              variant="ghost"
              className="h-auto w-full justify-start whitespace-pre-wrap px-1 py-1"
            >
              <a href={`/dashboard/bookmarks/${item.id}`} className="text-left">
                <p className="text-xs">{item.content.title}</p>
              </a>
            </Button>
          ) : (
            // memo
            ""
          )}
          <Badge
            variant={"outline"}
            className="my-4 ml-auto mr-0.5 px-1 text-xs font-semibold"
          >
            {item.type}
          </Badge>
        </div>
      </CardHeader>
      {/* TODO: 暫定デザイン。カードをもっと小さくできるように、レイアウトを圧縮したい */}
      <CardContent className="p-0 text-left">
        {item.type === "bookmark" ? (
          <Button
            variant="outline"
            className="w-full justify-start whitespace-pre-wrap py-8"
          >
            <a href={`/dashboard/bookmarks/${item.id}`}>
              <div className="flex flex-row gap-2">
                {/* TODO: 画像のサイズは適当なのでいい感じにする */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.content.imageUrl}
                  alt="avatar"
                  key={item.id}
                  width="128"
                  height="64"
                />
                <div className="text-xs">{item.content.description}</div>
              </div>
            </a>
          </Button>
        ) : (
          // memo
          <div className="flex px-3 py-1 text-left">
            <div className="text-xs">{item.content.content}</div>
          </div>
        )}
      </CardContent>
      <CardDescription className="flex gap-1 px-3 py-0.5">
        {item.type === "bookmark"
          ? // bookmark
            item.content.bookmarksToTags.map(({ tag: { id, name } }) => (
              <span key={id}>#{name}</span>
            ))
          : ""}
      </CardDescription>
    </Card>
  );
}
