import { Flag, Share } from "react-feather";

const Button = ({ type, label, styles }: { type: "share" | "report"; label?: string; styles?: string }) => {
  return (
    <button className={"btn " + styles}>
      {type === "share" ? (
        <>
          <Share size={15} />
          {label ? label : "Share"}
        </>
      ) : type === "report" ? (
        <>
         <Flag size={15} />
        {label ? label : "Report"}
        </>
      ) : (
        <></>
      )}
    </button>
  );
};

export default Button;
