"use client";

export default function Error({reset}: { reset: () => void }) {
  return (
    <div className="h-screen flex justify-center items-center bg-base-300 text-[#ebebeb]">
      <div className="flex flex-col items-center gap-10 text-center">
        <h1 className="font-bold text-5xl">Something Went Wrong!</h1>
        <div className="flex flex-col items-center gap-5">
          <span className="text-xs">An unexpected error occurred in the application</span>
          <span className="text-xs">Click the button below to try again</span>
        </div>
        <button className="btn min-h-11 h-11 text-[#ebebeb] bg-blue-700 hover:bg-blue-800" onClick={() => reset()}>
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
          </svg>
          Retry
        </button>
      </div>
    </div>
  )
}
