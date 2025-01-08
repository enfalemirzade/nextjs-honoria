"use client";

import useSWR from "swr";
import { useDialogsStore } from "@/store/dialogsStore";
import { User, Profile } from "@/types/models";
import { useParams } from "next/navigation";
import { Channel } from "@/types/models";

export default function ChannelMain() {
  const { openDialog } = useDialogsStore()
  const { code } = useParams()

  const { data: channel, isLoading:isChannelLoading } = useSWR<Channel>(`/api/channel/${code}/main/get`)
  const { data: users, isLoading:isUsersLoading } = useSWR<User[]>(`/api/channel/${code}/users/list`)
  const { data: profile, isLoading:isProfileLoading } = useSWR<Profile>(`/api/user/profile/get`)

  return(
    <div className="h-full items-center flex flex-col p-10">
      {(isChannelLoading || isUsersLoading || isProfileLoading) ? (
        <div className="h-full flex justify-center items-center bg-transparent text-[#ebebeb]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) :
      <div className="h-full flex flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div className="flex justify-center items-center gap-2 text-4xl text-center font-bold">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m17 21-5-4-5 4V3.889a.92.92 0 0 1 .244-.629.808.808 0 0 1 .59-.26h8.333a.81.81 0 0 1 .589.26.92.92 0 0 1 .244.63V21Z"/>
            </svg>
            <div className="max-w-[260px] truncate sm:max-w-[320px] h-[50px]">{channel?.name}</div>
            <span className="text-xl text-[#c5c5c5]">#{channel?.code}</span>
          </div>
          <div className="flex flex-col items-center gap-5">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"/>
            </svg>
            <span className="text-xs">You can enjoy all the features you desire</span>
            <span className="text-xs">Use the sidebar to get started</span>
          </div>
        </div>
        <div className="join justify-center">
          <button disabled={ users?.some((user) => user.id === profile?.id && user.role !== "OWNER") } onClick={(() => openDialog("serverOptionsDialog"))} className="btn join-item bg-base-100 border-y-0 text-[#ebebeb] hover:bg-neutral">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            </svg>
            Options
          </button>
          <button disabled={ users?.some((user) => user.id === profile?.id && user.role === "MEMBER") } onClick={(() => openDialog("serverLogDialog"))} className="btn join-item bg-base-100 text-[#ebebeb] hover:bg-neutral">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M10 12v1h4v-1m4 7H6a1 1 0 0 1-1-1V9h14v9a1 1 0 0 1-1 1ZM4 5h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
            </svg>
            Server Log
          </button>
          <button disabled={ users?.some((user) => user.id === profile?.id && user.role === "MEMBER") } onClick={(() => openDialog("banListDialog"))} className="btn join-item bg-base-100 text-[#ebebeb] hover:bg-neutral">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            Ban List
          </button>
        </div>
      </div>
      }
    </div>
  )
}
