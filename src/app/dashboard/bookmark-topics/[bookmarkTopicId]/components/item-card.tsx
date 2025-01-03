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
import { Avatar, AvatarImage } from "~/components/ui/avatar";

export interface Item {
  id: UniqueIdentifier;
  quadrantId: string;
  title: string;
  description: string;
  imageUrl: string;
  bookmarksToTags: {
    tag: { id: string; name: string };
  }[];
  badge: string;
}

interface ItemCardProps {
  item: Item;
  isOverlay?: boolean;
}

export type ItemType = "Item";

export interface ItemDragData {
  type: ItemType;
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
      {/* TODO: レイアウトをもっと小さくしたい */}
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
          <Button
            variant="ghost"
            className="h-auto w-full justify-start whitespace-pre-wrap px-1 py-1"
          >
            <a href={`/dashboard/bookmarks/${item.id}`} className="text-left">
              <p className="text-xs">{item.title}</p>
            </a>
          </Button>
          <Badge
            variant={"outline"}
            className="my-4 ml-auto px-1 text-xs font-semibold"
          >
            {item.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 text-left">
        <Button
          variant="outline"
          className="w-full justify-start whitespace-pre-wrap py-8"
        >
          <a href={`/dashboard/bookmarks/${item.id}`}>
            <div className="flex flex-row gap-2">
              {/* TODO: 簡単に外部URLの画像を表示する手段が見つからなかったため、暫定デザイン */}
              <Avatar>
                <AvatarImage src={item.imageUrl} alt="avatar" />
              </Avatar>
              <div className="text-xs">{item.description}</div>
            </div>
          </a>
        </Button>
      </CardContent>
      <CardDescription className="flex gap-1 px-3 py-0.5">
        {item.bookmarksToTags.map(({ tag: { id, name } }) => (
          <span key={id}>#{name}</span>
        ))}
      </CardDescription>
    </Card>
  );
}
