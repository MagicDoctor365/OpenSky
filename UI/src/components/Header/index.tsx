"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/marketNft", label: "Market" },
    { href: "/mintNft", label: "Mint NFT" },
    { href: "/myNft", label: "My NFT" },
  ];

  return (
    <div className="flex top-0 py-3 flex-wrap justify-between absolute w-full h-[4rem]">
      <div>Icon</div>
      <div className="flex gap-[40px] text-m">
        {links.map(({ label, href }) => {
          const isActive =
            pathname === href ||
            (pathname.startsWith(href) && pathname !== "/");
          return (
            <Link
              href={href}
              key={label}
              className={`hover:text-primary px-3 py-2 text-xl ${
                isActive ? "text-primary font-bold" : ""
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div className="flex justify-end items-center gap-4 mr-8">
        <ConnectButton />
      </div>
    </div>
  );
}
