"use client";

import useSWR, { useSWRConfig } from "swr";
import Image from "next/image";
import axios from "axios";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { usePanelsStore } from "@/store/panelsStore";
import { useState } from "react";

export function FileViewer() {
  const [ isLoading, setIsLoading] = useState<boolean>(false)
  const [ error, setError] = useState<string | null>(null)
  const { panels, openPanel } = usePanelsStore()
  const { code, fileId } = useParams()
  const { mutate } = useSWRConfig()
  const router = useRouter()

  const { data: file, isLoading: isFileLoading } = useSWR<{name: string, type: string, size: number, createdAt: Date, sender: {name: string}}>(
    fileId ? `/api/channel/${code}/cloud/file/${fileId}/data/get` : null
  )

  const onSubmit = async () => {
    setIsLoading(true)

    const data = {
      code: code,
      id: fileId
    }

    try {
      const res = await axios.post(`/api/channel/${code}/cloud/file/${fileId}/data/delete`, data)

      if (res.status === 200) {
        router.push(`/${code}/cloud`)
        mutate(`/api/channel/${code}/cloud/folder/list`, undefined)
      }
    } catch (error: unknown) {
      console.error(error)
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return(
    <div style={{ width: "calc(100% - 300px)" }} className={clsx("relative rounded-xl flex max-[1024px]:!w-full justify-center items-center text-[#ebebeb]", {"opacity-40 pointer-events-none": panels.filePanel})}>
      <div className="lg:hidden absolute left-0 top-0">
        <button onClick={() => openPanel("filePanel")} className="btn min-h-10 h-10 px-3 bg-base-100 hover:bg-neutral text-[#ebebeb]">
          <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 8H4m0-2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/>
          </svg>
        </button>
      </div>
      {
        (isFileLoading || isLoading) ?
          <div className="h-full flex justify-center items-center bg-transparent text-[#ebebeb]">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        : !file ?
          <svg className="text-neutral" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="65" height="65" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M10 3v4a1 1 0 0 1-1 1H5m14-4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"/>
          </svg>
        :
        <div className="w-full h-full flex flex-col">
          <div className="absolute flex gap-2 right-0 top-0">
            <button onClick={() => { const link = document.createElement("a"); link.href = `/api/channel/${code}/cloud/file/${fileId}`; link.download = file?.name || "download"; link.click();}} className="btn min-h-9 h-9 px-2 bg-base-100 text-[#ebebeb] hover:bg-neutral">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"/>
              </svg>
            </button>
            <button onClick={() => onSubmit()} disabled={isLoading} className="btn min-h-9 h-9 px-2 bg-base-100 text-[#ebebeb] hover:bg-rose-700">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
              </svg>
            </button>
          </div>
          {error && <span className="text-xs text-red-500">{error}</span>}
          <div style={{ height: "calc(100% - 26px)" }} className="flex justify-center items-center">
            {file?.type.startsWith("image") &&
              <Image 
                src={fileId && code ? `/api/channel/${code}/cloud/file/${fileId}` : ""}
                width={500}
                height={500}
                alt={file?.name}
                className="w-auto h-auto max-w-full max-h-[320px] lg:max-w-[500px] lg:max-h-[350px]"
              />
            }
            {file?.type.startsWith("text") ?
              <div className="flex flex-col text-sm gap-3">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="65" height="65" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 3v4a1 1 0 0 1-1 1H5m4 4 1 5 2-3.333L14 17l1-5m4-8v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"/>
                </svg>
              </div> 
            :file?.type.startsWith("video") ?
              <div className="flex flex-col text-sm gap-3">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="65" height="65" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" d="M10 3v4a1 1 0 0 1-1 1H5m14-4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1ZM9 12h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Zm5.697 2.395v-.733l1.269-1.219v2.984l-1.268-1.032Z"/>
                </svg>
              </div>
            :file?.type.startsWith("audio") ?
              <div className="flex flex-col text-sm gap-3">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="65" height="65" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 3v4a1 1 0 0 1-1 1H5m8 7.5V8s3 1 3 4m3-8v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Zm-6 12c0 1.105-1.12 2-2.5 2S8 17.105 8 16s1.12-2 2.5-2 2.5.895 2.5 2Z"/>
                </svg>
              </div>
            :file?.type.startsWith("application") ?
              <div className="flex flex-col text-sm gap-3">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="65" height="65" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 10V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1v6M5 19v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1M10 3v4a1 1 0 0 1-1 1H5m14 9.006h-.335a1.647 1.647 0 0 1-1.647-1.647v-1.706a1.647 1.647 0 0 1 1.647-1.647L19 12M5 12v5h1.375A1.626 1.626 0 0 0 8 15.375v-1.75A1.626 1.626 0 0 0 6.375 12H5Zm9 1.5v2a1.5 1.5 0 0 1-1.5 1.5v0a1.5 1.5 0 0 1-1.5-1.5v-2a1.5 1.5 0 0 1 1.5-1.5v0a1.5 1.5 0 0 1 1.5 1.5Z"/>
                </svg>
              </div>
              : null
            }
          </div>
          <div className="h-[26px] flex flex-col justify-center items-center gap-1 text-xs">
            <div className="flex gap-3 text-[#c5c5c5] font-bold">
              <span className="w-[120px]">Name</span>
              <span className="w-[60px]">Size</span>
              <span className="w-[60px]">User</span>
              <span className="w-[60px]">Date</span>
            </div>
            <div className="flex gap-3">
              <span className="w-[120px] truncate">{file?.name}</span>
              <span className="w-[60px] truncate">{(file?.size / 1024 / 1024).toFixed(1)}mb</span>
              <span className="w-[60px] truncate">{file?.sender.name}</span>
              {(() => {
                const createdAt = new Date(file?.createdAt)
                return (
                  <span className="w-[60px]">{`${String(createdAt.getUTCDate()).padStart(2, '0')}.${String(createdAt.getUTCMonth() + 1).padStart(2, '0')}.${createdAt.getUTCFullYear().toString().slice(-2)}`}</span>
                )
              })()}
            </div>
          </div>
        </div>
      }      
    </div>
  )
}
