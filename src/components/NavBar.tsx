import React from "react";

interface NavBarProps {
  site: string;
}

const NavBar = ({ site }: NavBarProps) => {
  return (
    <div className="min-w-full border-2 border-red-600 h-20">
      <div className="flex flex-col">
        <div className="flex">
          <h1>WebRoll</h1>
          <button>Like</button>
          <button>Next</button>
          <button>Info</button>
          <button>Report</button>
          <button>Sidebar</button>
        </div>
        <span>{site}</span>
      </div>
    </div>
  );
};

export default NavBar;
