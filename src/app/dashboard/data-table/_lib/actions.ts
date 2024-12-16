"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "~/db/index";
import { tasks } from "~/db/schema";
import { takeFirstOrThrow } from "~/db/utils";
import { getErrorMessage } from "~/lib/handle-error";
import type { UpdateTaskSchema } from "./validations";

export async function updateTask(input: UpdateTaskSchema & { id: string }) {
  try {
    const data = await db
      .update(tasks)
      .set({
        title: input.title,
        label: input.label,
        status: input.status,
        priority: input.priority,
      })
      .where(eq(tasks.id, input.id))
      .returning({
        status: tasks.status,
        priority: tasks.priority,
      })
      .then(takeFirstOrThrow);

    revalidateTag("tasks");
    if (data.status === input.status) {
      revalidateTag("task-status-counts");
    }
    if (data.priority === input.priority) {
      revalidateTag("task-priority-counts");
    }

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteTasks(input: { ids: string[] }) {
  try {
    await db.delete(tasks).where(inArray(tasks.id, input.ids));

    revalidateTag("tasks");
    revalidateTag("task-status-counts");
    revalidateTag("task-priority-counts");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
