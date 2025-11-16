import classNames from "classnames";
import styles from "./Notice.module.css";


export function Notice(props: {
  tone: "info" | "warning" | "error";
  message: string;
}) {
  return <div className={classNames(
    styles.notice,
    'notice',
    styles[`notice-${props.tone}`],
    `notice--${props.tone}`
  )}>{props.message}</div>;
}
