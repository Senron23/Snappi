"use client";
import Image from "next/image";
import { useState } from "react";

const DropdownList = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="filter-trigger">
          <figure>
            <Image
              src="/assets/icons/hamburger.svg"
              alt="Dropdown Icon"
              width={14}
              height={14}
            />
            Most recent
          </figure>
          <Image
            src="/assets/icons/arrow-down.svg"
            alt="Arrow Down Icon"
            width={20}
            height={20}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
        </div>
      </div>
      {isOpen && (
        <ul className="dropdown font-bold">
            {['Most recent', 'Most viewed', 'Most liked', 'Oldest'].map((option) => (
            <li key={option} className="list-item">
                {option}
            </li>
              

            ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownList;
