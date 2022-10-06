import { RefreshCw } from "react-feather";

export default function Refresh({
  styles = "",
  iconStyles = "",
  size = 20,
  clickAction = () => window.location.reload(),
}: {
  styles?: string;
  iconStyles?: string;
  size?: number;
  clickAction?: Function;
}) {
  return (
    <button onClick={() => clickAction()} className={styles}>
      <RefreshCw
        size={size}
        className={"group-hover:rotate-180 transition-transform duration-500 ease-in-out " + iconStyles}
      />
    </button>
  );
}
