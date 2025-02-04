"use client";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { deleteAutoTagKeywordAction } from "./actions";
import { toast } from "sonner";

const deleteKeywordAction = async (keywordId: string) => {
  const data = await deleteAutoTagKeywordAction(keywordId);
  if (data?.successful) {
    toast.success("Auto tag keyword deleted");
  } else {
    toast.error("Failed to delete auto tag keyword");
  }
};

export const AutoTaggingKeywordItem = ({
  id,
  keyword,
}: {
  id: string;
  keyword: string;
}) => {
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{keyword}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={async () => await deleteKeywordAction(id)}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};
