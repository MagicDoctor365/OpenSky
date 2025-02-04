"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import NextImage from "next/image";
import { Input } from "antd";

export default function Header() {
  const { address: curAccount } = useAccount();
  const pathname = usePathname();
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const links = curAccount
      ? [
          { href: "/market", label: "Market" },
          { href: "/mintNft", label: "Mint NFT" },
          { href: "/myNft", label: "My NFT" },
        ]
      : [{ href: "/market", label: "Market" }];
    setLinks(links);
  }, [curAccount]);

  return (
    <div className="flex fixed top-0 bg-white flex-wrap justify-between  w-full h-[4rem] border-b border-gray-300 shadow-md">
      <div className="flex items-center gap-4 ml-8">
        <NextImage src="/OpenSky.png" width={70} height={70} alt="logo" />
        <div className="text-3xl italic font-bold text-primary">Open Sky</div>
        <div className="border-l border-gray-500 h-10"></div>
        <div className="flex gap-[20px] text-m">
          {links.map(({ label, href }) => {
            const isActive =
              pathname === href ||
              (pathname.startsWith(href) && pathname !== "/");
            return (
              <Link
                href={href}
                key={label}
                className={`hover:text-primaryDark py-2 text-xl text-primary font-bold ${
                  isActive ? "text-primaryDark " : ""
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center ">
        <Input.Search
          placeholder="Search"
          size="large"
          onSearch={() => console.log("search")}
          style={{ width: 300 }}
        />
      </div>

      <div className="flex justify-end items-center gap-4 mr-8">
        <ConnectButton />
      </div>
    </div>
  );
}
