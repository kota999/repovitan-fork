"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDndContext, type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { type Item, ItemCard } from "./item-card";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { GripVertical } from "lucide-react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { EditableTitle } from "./editable-title";

export interface Quadrant {
  id: UniqueIdentifier;
  title: string;
  dbId: string;
}

export type QuadrantType = "Quadrant";

export interface QuadrantDragData {
  type: QuadrantType;
  quadrant: Quadrant;
}

interface BoardQuadrantProps {
  quadrant: Quadrant;
  items: Item[];
  quadrantGridRatio?: "hfull_w1/4" | "h1/2_wfull" | "h1/2_w1/2";
  isOverlay?: boolean;
}

export function BoardQuadrant({
  quadrant,
  items,
  quadrantGridRatio = "hfull_w1/4",
  isOverlay,
}: BoardQuadrantProps) {
  const itemsIds = useMemo(() => {
    return items.map((item) => item.id);
  }, [items]);

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
  const hxw =
    quadrantGridRatio === "hfull_w1/4"
      ? "h-[620px] w-1/4"
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
      <CardHeader className="space-between flex flex-row items-center border-b-2 p-4 text-left font-semibold">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className="relative -ml-2 h-auto cursor-grab p-1 text-primary/50"
        >
          <span className="sr-only">{`Move quadrant: ${quadrant.title}`}</span>
          <GripVertical />
        </Button>
        <div className="ml-auto">
          <EditableTitle quadrantId={quadrant.dbId} title={quadrant.title} />
        </div>
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex flex-grow flex-col gap-2 p-2">
          <SortableContext items={itemsIds}>
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </SortableContext>
        </CardContent>
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
      <div className="flex flex-row items-center justify-center gap-4">
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
