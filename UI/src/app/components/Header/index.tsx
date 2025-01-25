import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import React from 'react'

export default function Header() {
  return (
    <div className='flex top-0 py-3 flex-wrap justify-between absolute z-[9999] w-full h-[4rem]'>
    <div>
      Icon
    </div>
    <div className='flex gap-[40px] text-m'>
      <Link href='/CreateToken' className='hover:text-primary px-3 py-2 text-xl font-black '>Create Token</Link>
      <Link href='/TokenList' className='hover:text-primary px-3 py-2 text-xl font-black'>Token List</Link>
      <Link href='/DEX' className='hover:text-primary px-3 py-2 text-xl font-black'>DEX</Link>
    </div>
    <div className='flex justify-end items-center gap-4 mr-8'>
      <ConnectButton />
    </div>
    </div>
  )
};
