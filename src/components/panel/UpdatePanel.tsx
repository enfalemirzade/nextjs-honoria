"use client";

import useSWR from "swr";
import { usePanelsStore } from "@/store/panelsStore";
import { Blog } from "@/types/models";

export function UpdatePanel() {
  const { panels, closePanel } = usePanelsStore()

  const { data: updates, isLoading:isUpdatesLoading } = useSWR<Blog[]>("/api/blog/list")

  return (
    <div style={{ height: "calc(100% - 24px)" }}
      className={`fixed top-6 right-0 transform lg:relative lg:top-0 lg:!h-full lg:flex ${
        panels.updatePanel ? "-translate-x-0" : "translate-x-full"
      } transition-transform duration-300 lg:translate-x-0 z-10`}
    >
      <div className="w-[22rem] h-full flex flex-col px-8 border-l-4 border-neutral bg-base-300 lg:bg-base-200">
        <div className="h-24 flex items-center gap-3 font-bold">
          <button onClick={() => closePanel("updatePanel")} className="lg:hidden p-1.5 bg-base-100 rounded-btn hover:bg-neutral">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"/>
            </svg>
          </button>
          <span>Updates</span>
        </div>
        {isUpdatesLoading ? ( <div style={{ height: "calc(100vh - 150px)" }} className="skeleton rounded-lg bg-[#181d23]"></div>) :
          <div style={{ height: "calc(100vh - 150px)" }} className="overflow-y-auto rounded-lg bg-base-100">
            <table className="table table-zebra">
              <tbody>
                {updates?.map((update) => {
                  const createdAt = new Date(update.createdAt);
                  return (
                    <tr key={update.id} className="h-14">
                      <th>{update.content}</th>
                      <td className="max-w-28 truncate">{update.title}</td>
                      <td>{`${String(createdAt.getUTCDate()).padStart(2, '0')}.${String(createdAt.getUTCMonth() + 1).padStart(2, '0')}.${createdAt.getUTCFullYear().toString().slice(-2)}`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}
