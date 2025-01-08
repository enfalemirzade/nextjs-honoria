"use client";

import Link from "next/link";

export function ChannelError() {
  return (
    <div className="h-screen flex items-center justify-center bg-base-300 text-[#ebebeb]">
      <div className="flex flex-col items-center gap-10 text-center">
        <h1 className="text-5xl font-bold">Channel Not Found!</h1>
        <div className="flex flex-col items-center gap-5">
          <span className="text-xs">The channel is not available or you are not registered</span>
          <span className="text-xs">Click the button below to go home page</span>
        </div>
        <Link href={"/"}>
          <button className="btn text-[#ebebeb] bg-blue-700 hover:bg-blue-800 min-h-11 h-11">
            <svg className="w-[22px] h-[22px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
            </svg>
            Home
          </button>
        </Link>
      </div>
    </div>
  )
}
