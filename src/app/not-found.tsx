import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="h-screen flex justify-center items-center bg-base-300 text-[#ebebeb]">
      <div className="flex flex-col items-center gap-10 text-center">
        <h1 className="font-bold text-5xl">404 - Page Not Found!</h1>
        <div className="flex flex-col items-center gap-5">
          <span className="text-xs">The page you are looking for does not exist or may have been removed</span>
          <span className="text-xs">Click the button below to go home page</span>
        </div>
        <Link href={"/"} >
          <button className="btn min-h-11 h-11 text-[#ebebeb] bg-blue-700 hover:bg-blue-800">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
            </svg>
            Home
          </button>
        </Link>
      </div>
    </div>
  )
}
