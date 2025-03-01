"use client";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { deleteNodejsRequirePackageAction } from "./actions";
import { toast } from "sonner";

const deleteNodejsRequirePackage = async (id: string) => {
  const data = await deleteNodejsRequirePackageAction(id);
  if (data?.successful) {
    toast.success("A Require Package deleted");
  } else {
    toast.error("Failed to delete a Require Package");
  }
};

export const NodejsRequirePackageItem = ({
  id,
  packageName,
}: {
  id: string;
  packageName: string;
}) => {
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{packageName}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={async () => await deleteNodejsRequirePackage(id)}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};
