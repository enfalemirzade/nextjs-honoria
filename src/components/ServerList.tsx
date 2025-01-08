"use client";

import axios from "axios";
import useSWR from "swr";
import clsx from "clsx";
import { useDialogsStore } from "@/store/dialogsStore";
import { usePanelsStore } from "@/store/panelsStore";
import { removeFromList } from "@/utils/updateList";
import { useRouter } from "next/navigation";
import { Server } from "@/types/models";
import { useState } from "react";

export function ServerList() {
  const [ isLoading, setIsLoading] = useState<boolean>(false)
  const { panels, openPanel } = usePanelsStore()
  const { openDialog } = useDialogsStore()
  const router = useRouter()

  const { data: servers, isLoading:isServersLoading } = useSWR<Server[]>("/api/user/servers/list")

  const onSubmit = async (data: {id: string}) => {
    setIsLoading(true)

    try {
      const res = await axios.post("/api/user/servers/leave", data)

      if (res.status === 200) {
        removeFromList("/api/user/servers/list", data.id)
      }
    } catch (error: unknown) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={clsx("w-full", {"opacity-40 pointer-events-none": panels.profilePanel || panels.updatePanel})}>
      <div className="h-full flex flex-col">
        <div className="w-full h-20 flex justify-between items-center px-4 shadow-bottom-sm lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => openPanel("profilePanel")} className="rounded-btn mt-1 px-1.5 py-2 bg-base-100 hover:bg-neutral lg:hidden">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14"/>
              </svg>
            </button>
            <div className="font-bold">Servers</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={() => openDialog("addServerDialog")} className="rounded-btn flex items-center gap-1 p-1.5 pr-2.5 bg-blue-700 hover:bg-blue-800">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5"/>
              </svg>
              Add
            </button>
            <button onClick={() => openPanel("updatePanel")} className="rounded-btn px-1.5 py-2 bg-base-100 hover:bg-neutral lg:hidden">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
            </button>
          </div>
        </div>
        <div style={{ height: "calc(100% - 80px)" }} className="flex flex-col px-8 py-6 text-sm">
          <div className="h-full flex justify-center overflow-y-auto">
            <div className="max-w-[600px] w-full">
              {
                isServersLoading ?
                <div className="flex flex-col gap-6">
                  <div className="skeleton h-[66px] rounded-lg bg-[#171c21]"></div>
                  <div className="skeleton h-[66px] rounded-lg bg-[#171c21]"></div>
                  <div className="skeleton h-[66px] rounded-lg bg-[#171c21]"></div>
                </div> :
                !servers?.length ?
                <div className="flex justify-center items-center gap-2 text-[#c5c5c5]">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.122 17.645a7.185 7.185 0 0 1-2.656 2.495 7.06 7.06 0 0 1-3.52.853 6.617 6.617 0 0 1-3.306-.718 6.73 6.73 0 0 1-2.54-2.266c-2.672-4.57.287-8.846.887-9.668A4.448 4.448 0 0 0 8.07 6.31 4.49 4.49 0 0 0 7.997 4c1.284.965 6.43 3.258 5.525 10.631 1.496-1.136 2.7-3.046 2.846-6.216 1.43 1.061 3.985 5.462 1.754 9.23Z"/>
                  </svg>
                  <span>Create or join a server</span>
                </div> :
                <div className="flex flex-col gap-5">
                  {servers?.map((serverMember) => (
                    <div key={serverMember.server.id} onClick={() => router.push(`/${serverMember.server.code}` )} className="h-[66px] flex justify-between items-center p-4 cursor-pointer rounded-lg bg-base-100 hover:bg-neutral">
                      <div className="flex gap-1.5">
                        <div className="max-w-[400px] truncate">{serverMember.server.name}</div>
                        <div className="mt-[3.7px] text-xs text-[#c5c5c5]">#{serverMember.server.code}</div>
                        {serverMember.server.isPrivate ?
                          <svg className="mt-[3.7px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z" clipRule="evenodd"/>
                          </svg> : ""
                        }
                      </div>
                      {serverMember.role === "OWNER" ? "" :
                        <div className="flex">
                          <button disabled={isLoading} onClick={(e) => { e.stopPropagation(); onSubmit({id: serverMember.server.id})}} className="p-2 hover:bg-rose-700 rounded-btn">
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
