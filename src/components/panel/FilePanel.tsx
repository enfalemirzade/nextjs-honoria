"use client";

import useSWR, { useSWRConfig } from "swr";
import { useDialogsStore } from "@/store/dialogsStore";
import { useParams, useRouter } from "next/navigation";
import { usePanelsStore } from "@/store/panelsStore";
import { Folder } from "@/types/models";
import { useState } from "react";

export function FilePanel() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { panels, closePanel } = usePanelsStore()
  const { openDialog } = useDialogsStore()
  const { code, fileId } = useParams()
  const { mutate } = useSWRConfig()
  const router = useRouter()

  const { data: folders, isLoading: isFoldersLoading } = useSWR<Folder[]>(`/api/channel/${code}/cloud/folder/list`)

  const reset = async () => {
    setIsLoading(true)
    mutate(`/api/channel/${code}/cloud/folder/list`, undefined)
    setTimeout(() => { setIsLoading(false) }, 30000)
  }

  return(
    <div style={{ height: "calc(100% - 104px)" }}
      className={`fixed lg:relative top-[104px] lg:!h-full lg:top-0 left-0 lg:flex transform ${
        panels.filePanel ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 lg:translate-x-0 z-10`}
    >
      <div className="flex flex-col bg-base-200 border-r-4 border-neutral h-full justify-between">
        <div className="flex justify-between text-sm font-bold px-4 mb-3 lg:pl-0">
          <div>Folders</div>
          <button onClick={() => reset()} disabled={isLoading} className="cursor-pointer hover:text-[#c5c5c5] disabled:text-[#c5c5c5] disabled:cursor-default">
            <svg className="mt-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
            </svg>
          </button>
        </div>
        <div style={{ height: "calc(100% - 60px)" }} className="overflow-y-auto">
          <ul className="menu menu-xs gap-1 rounded-lg w-72 max-w-xs pr-5 pl-4 lg:pl-0">
            {(isFoldersLoading) && (
              <div className="flex flex-col gap-6 mt-2">
                <div className="skeleton w-full h-4 bg-[#171c21]"></div>
                <div className="skeleton w-full h-4 bg-[#171c21]"></div>
                <div className="skeleton w-full h-4 bg-[#171c21]"></div>
              </div>
            )}
            {folders?.map((folder) => (
              <li key={folder.id}>
                <details open={folder.files.some((file) => file.id === fileId)}>
                  <summary>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    {folder.name}
                  </summary>
                  <ul>
                    {folder.files.map((file) => (
                      <li key={file.id}>
                        <div onClick={() => router.push(`/${code}/cloud/${file.id}`)} className={`${file.id === fileId && "active"}`}>
                          {file.type.startsWith("image") ? 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          }
                          {file.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex px-3 py-2 justify-between">
          <div className='flex gap-2'>
            <button onClick={() => openDialog("createFolderDialog")} className="btn min-h-10 h-10 bg-base-100 hover:bg-neutral px-3 text-[#ebebeb]">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 8H4m8 3.5v5M9.5 14h5M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/>
              </svg>
            </button>
            <button onClick={() => openDialog("uploadFileDialog")} className="btn min-h-10 h-10 bg-base-100 hover:bg-neutral px-3 text-[#ebebeb]">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9V4a1 1 0 0 0-1-1H8.914a1 1 0 0 0-.707.293L4.293 7.207A1 1 0 0 0 4 7.914V20a1 1 0 0 0 1 1h4M9 3v4a1 1 0 0 1-1 1H4m11 6v4m-2-2h4m3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"/>
              </svg>
            </button>
          </div>
          <button onClick={() => closePanel("filePanel")} className="btn lg:hidden min-h-10 h-10 bg-base-100 hover:bg-neutral px-3 text-[#ebebeb]">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
