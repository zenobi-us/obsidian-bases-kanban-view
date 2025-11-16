import { useDraggable } from "@dnd-kit/core";
import React, { PropsWithChildren } from "react";

export function Draggable(props: PropsWithChildren<{ id: string; }>) {
  const draggable = useDraggable({
    id: props.id,
  });

  return (
    <div className="draggable"ref={draggable.setNodeRef} {...draggable.listeners} {...draggable.attributes}>
      {props.children}
    </div>
  );
}
