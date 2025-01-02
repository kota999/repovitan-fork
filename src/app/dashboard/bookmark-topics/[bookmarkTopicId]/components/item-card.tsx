"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { Badge } from "~/components/ui/badge";

export interface Item {
  id: UniqueIdentifier;
  quadrantId: string;
  content: string;
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
      <CardHeader className="space-between relative flex flex-row border-b-2 border-secondary px-3 py-3">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className="-ml-2 h-auto cursor-grab p-1 text-secondary-foreground/50"
        >
          <span className="sr-only">Move item</span>
          <GripVertical />
        </Button>
        <Badge variant={"outline"} className="ml-auto font-semibold">
          {item.badge}
        </Badge>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap px-3 pb-6 pt-3 text-left">
        {item.content}
      </CardContent>
    </Card>
  );
}
