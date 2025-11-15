import React from "react";


export function Notice(props: {
  tone: "info" | "warning" | "error";
  message: string;
}) {
  return <div className={`notice notice-${props.tone}`}>{props.message}</div>;
}
