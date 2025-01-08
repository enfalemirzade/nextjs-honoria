"use client";

import axios from "axios";
import { SWRConfig, SWRConfiguration } from "swr";
import { useState, useCallback } from "react";

interface SWRContextProps {
  children: React.ReactNode
}

export default function SWRContext({ children }: SWRContextProps) {
  const [error, setError] = useState<{error: Error | null; url: string | null }>({ error: null, url: null })
  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = useCallback(async () => {
    if (isRetrying || !error.url) return
    setIsRetrying(true)

    try {
      await fetcher(error.url)
      setError({ error: null, url: null })
    } catch (err) {
      console.error(err)
      setTimeout(() => { setIsRetrying(false)}, 5000)
    }
  }, [isRetrying, error.url])

  const SWROptions: SWRConfiguration = {
    fetcher,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    onError: (err: Error, key: string) => {
      setError({ error: err, url: key })
    }
  }

  if (error.error) {
    return (
      <div className="h-screen flex justify-center items-center bg-base-300 text-[#ebebeb]">
        <div className="flex flex-col items-center gap-10 text-center">
          <h1 className="font-bold text-5xl">Connection Error!</h1>
          <div className="flex flex-col items-center gap-5">
            <span className="text-xs">Some network error occurred while trying to connect to the server</span>
            <span className="text-xs">Click the button below to try again</span>
          </div>
          <button className="btn min-h-11 h-11 bg-blue-700 text-[#ebebeb] hover:bg-blue-800" onClick={retry} disabled={isRetrying}> 
            { isRetrying ? <span className="loading loading-spinner"></span> : 
              <>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
                </svg>
                Retry 
              </>
            }
          </button>
        </div>
      </div>
    )
  }

  return (
    <SWRConfig value={SWROptions}>
      {children}
    </SWRConfig>
  )
}
