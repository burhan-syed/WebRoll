import { RefreshCw } from "react-feather";

export default function Refresh({
  styles = "",
  size = 20,
}: {
  styles?: string;
  size?: number;
}) {
  return (
    <button onClick={() => window.location.reload()} className={styles}>
      <RefreshCw size={size} className="group-hover:rotate-180 transition-transform duration-500 ease-in-out" />
    </button>
  );
}
