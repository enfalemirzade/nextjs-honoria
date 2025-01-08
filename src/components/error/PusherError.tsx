"use client";

export function PusherError() {
  return (
    <div className="w-full h-full flex justify-center items-center bg-base-300 text-[#ebebeb]">
      <div className="flex flex-col items-center gap-10 text-center">
        <h1 className="font-bold text-5xl">Connection Error!</h1>
        <div className="flex flex-col items-center gap-5">
          <span className="text-xs">Some network error occurred while trying to connect to the server</span>
          <span className="text-xs">Please try again later</span>
        </div>
      </div>
    </div>
  )
}
