"use client";

import useSWR from "swr";
import { addToList, editList, removeFromList } from "@/utils/updateList";
import { watchlistHandler } from "@/utils/watchlistHandler";
import { Profile, Notice, Friend } from "@/types/models";
import { useDialogsStore } from "@/store/dialogsStore";
import { useFriendsStore } from "@/store/friendsStore";
import { usePanelsStore } from "@/store/panelsStore";
import { usePusher } from "@/context/PusherContext";
import { sortFriends } from "@/utils/listSorter";
import { signOut } from "next-auth/react";
import { pusher } from "@/lib/pusher";
import { useEffect } from "react";

export function ProfilePanel() {
  const { friends: updatedFriends, clear } = useFriendsStore()
  const { setData, openDialog } = useDialogsStore()
  const { panels, closePanel } = usePanelsStore()
  const { channel } = usePusher()

  const { data: friends, isLoading:isFriendsLoading } = useSWR<Friend[]>("/api/user/friends/list")
  const { data: profile, isLoading:isProfileLoading } = useSWR<Profile>("/api/user/profile/get")
  const { data: notices } = useSWR<Notice[]>("/api/user/notices/list")

  useEffect(() => {
    if(isFriendsLoading === false && updatedFriends.length) {
      updatedFriends.forEach((friend) => {
        watchlistHandler(friend)
      })

      clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedFriends, isFriendsLoading])

  useEffect(() => {
    if (!channel) return

    channel.bind("add-friend", ({updatedFriend, updatedNotice}: {updatedFriend: Friend, updatedNotice: string | null}) => {
      addToList("/api/user/friends/list", updatedFriend, sortFriends)
      if(updatedNotice) removeFromList("/api/user/notices/list", updatedNotice)
      pusher.disconnect()
    })

    channel.bind("remove-friend", (updatedFriendId: string) => {
      removeFromList("/api/user/friends/list", updatedFriendId)
    })

    channel.bind("update-friend", (updatedFriendData: Friend) => {
      editList("/api/user/friends/list", updatedFriendData)
    })

    channel.bind("add-notice", (updatedNotice: Notice) => {
      addToList("/api/user/notices/list", updatedNotice)
    })
  }, [channel])

  return (
    <div style={{ height: "calc(100% - 24px)" }}
      className={`fixed top-6 left-0 transform lg:relative lg:top-0 lg:!h-full lg:flex ${
        panels.profilePanel ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 lg:translate-x-0 z-10`}
    >
      <div className="w-[22rem] h-full flex flex-col justify-between bg-base-300">
        <div className="h-full flex flex-col">
          <div className="max-w-[300px] h-24 flex items-center justify-between px-8 truncate font-bold text-xl">
            {isProfileLoading ? <div className="skeleton h-4 w-full bg-base-200"></div> : profile?.name}
          </div>
          <div style={{ height: "calc(100% - 96px)" }} className="flex flex-col px-8 overflow-y-auto text-sm">
            <div className="flex justify-between items-center">
              <div className="py-4 text-base font-bold">Friends</div>
              <button onClick={() => openDialog("addFriendDialog")} className="mt-2 hover:text-[#c5c5c5]">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12h4m-2 2v-4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </button>
            </div>
            {isFriendsLoading && (
              <div className="flex flex-col gap-6 mt-6">
                <div className="skeleton w-full h-4 bg-base-200"></div>
                <div className="skeleton w-full h-4 bg-base-200"></div>
                <div className="skeleton w-full h-4 bg-base-200"></div>
              </div>
            )}
            {friends?.map((friend) => (
              <div key={friend.id} className={`flex justify-between items-center py-4 px-2 ${!friend.isOnline && "opacity-60"}`}>
                <div className="truncate max-w-52">{friend.name}</div>
                <div className="flex gap-1 pt-[1px]">
                  <button onClick={() => { setData("selectedFriend", friend); openDialog("friendDialog") }} className="rounded-btn p-1 hover:bg-neutral">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="1.5" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between px-4 py-5">
          <div className="flex gap-2">
            <button onClick={() => signOut()} className="rounded-btn flex justify-center py-2 px-2.5 bg-base-100 hover:bg-rose-700">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"/>
              </svg>
            </button>
            <button onClick={() => openDialog("optionsDialog")} className="rounded-btn flex justify-center py-2 px-2.5 bg-base-100 hover:bg-neutral">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
              </svg>
            </button>
            <div className="indicator">
              {notices?.length ? <span className="indicator-item top-1 right-1 badge bg-blue-500 text-[#ebebeb] text-xs">{notices?.length}</span> : ""}
              <button onClick={() => openDialog("notificationDialog")} className="rounded-btn flex justify-center py-2 px-2.5 bg-base-100 hover:bg-neutral">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z"/>
                </svg>
              </button>
            </div>
          </div>
          <div>
            <button onClick={() => closePanel("profilePanel")} className="rounded-btn flex justify-center py-2 px-2.5 bg-base-100 hover:bg-neutral lg:hidden">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
