"use client";

import useSWR from "swr";
import { addToList, editList, removeFromList } from "@/utils/updateList";
import { User, Message, Channel, Profile } from "@/types/models";
import { sortChat, sortUsers } from "@/utils/listSorter";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from 'next/navigation';
import { useDialogsStore } from "@/store/dialogsStore";
import { usePanelsStore } from "@/store/panelsStore";
import { usePusher } from "@/context/PusherContext";
import { usePeerAudio } from "@/utils/usePeerAudio";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { pusher } from "@/lib/pusher";

export function ServerPanel() {
  const { setData, openDialog } = useDialogsStore()
  const { panels, closePanel } = usePanelsStore()
  const [ seconds, setSeconds ] = useState(0)
  const { channel, members } = usePusher()
  const pathname = usePathname()
  const { code } = useParams()
  const router = useRouter()
  const {
    waitingForAnswer,
    remoteAudioRef,
    localAudioRef,
    muted,
    call,
    handleAnswerCall,
    handleEndCall,
    toggleMute,
    startCall
  } = usePeerAudio()

  const { data: channelinfo, isLoading:isChannelLoading } = useSWR<Channel>(`/api/channel/${code}/main/get`)
  const { data: users, isLoading:isUsersLoading } = useSWR<User[]>(`/api/channel/${code}/users/list`)
  const { data: profile, isLoading:isProfileLoading } = useSWR<Profile>(`/api/user/profile/get`)
  const { isLoading:isMessagesLoading } = useSWR<Message[]>(`/api/channel/${code}/chat/list`)

  useEffect(() => {
    if(call) {
      let interval: NodeJS.Timeout

      call.on("stream", () => {
        interval = setInterval(() => {  
          setSeconds(prev => prev + 1)
        }, 1000)
      })

      return () => {
        clearInterval(interval)
        handleEndCall()
        setSeconds(0)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call])

  useEffect(() => {
    if(channel && members && !isUsersLoading && !isMessagesLoading && profile) {
      members.each(function (member: {id: string, info: unknown}) {
        editList(`/api/channel/${code}/users/list`, {id: member.id, isOnline: true}, sortUsers)
      })

      channel.bind("add-user", (user: User) => {
        addToList(`/api/channel/${code}/users/list`, user, sortUsers)
      })

      channel.bind("update-user", (update: User) => {
        editList(`/api/channel/${code}/users/list`, update, sortUsers)
      })

      pusher.user.bind("add-friend", () => {
        if(!pusher.channels.find(`private-user-${profile.id}`)) {
          pusher.disconnect()
        }
      })

      channel.bind("remove-user", (userId: string) => {
        if(userId === "ALL") {
          window.location.href = "/"
        } else {
          removeFromList(`/api/channel/${code}/users/list`, userId)
          if(userId === profile.id) {
            window.location.href = "/"
          }
        }
      })

      channel.bind("pusher:member_added", (member: {id: string, info: unknown}) => {
        editList(`/api/channel/${code}/users/list`, {id: member.id, isOnline: true}, sortUsers)
      })
  
      channel.bind("pusher:member_removed", (member: {id: string, info: unknown}) => {
        editList(`/api/channel/${code}/users/list`, {id: member.id, isOnline: false}, sortUsers)
      })

      channel.bind("add-message", (updatedMessage: Message) => {
        if(updatedMessage.senderId !== profile?.id) {
          addToList(`/api/channel/${code}/chat/list`, updatedMessage, sortChat)
        }
      })
    }
  }, [channel, members, profile, isUsersLoading, isMessagesLoading, code])

  useEffect(() => {
    if(!channel && !members && !isUsersLoading && !isMessagesLoading && profile && users) {
      users.forEach((user) => {
        if((user.id === profile.id) && user.isOnline === false) {
          window.location.reload()
        } 
      })
    }
  }, [channel, isMessagesLoading, isUsersLoading, members, profile, users])

  return (
    <div style={{ height: "calc(100% - 24px)" }}
      className={`fixed top-6 left-0 transform lg:relative lg:top-0 lg:!h-full lg:flex
        ${panels.serverPanel ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 lg:translate-x-0 z-10`}
    >
      <div className="h-full flex flex-col lg:flex-row">
        <div className="flex flex-row justify-between px-3 py-4 bg-base-300 border-b-4 border-neutral lg:flex-col lg:border-b-0 lg:!border-r-4">
          <div className="flex flex-row gap-3 lg:flex-col">
            <button onClick={() => {router.push(`/${code}`); closePanel("serverPanel")}} className={`rounded-btn flex justify-center py-2 px-2.5 hover:bg-neutral ${!pathname.split("/")[2] ? "bg-base-100" : ""}`}>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
              </svg>
            </button>
            <button onClick={() => {router.push(`/${code}/cloud`); closePanel("serverPanel")}} className={`rounded-btn flex justify-center py-2 px-2.5 hover:bg-neutral ${pathname.match("/cloud") ? "bg-base-100" : ""}`}>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 8H4m0-2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/>
              </svg>
            </button>
            <button onClick={() => {router.push(`/${code}/chat`); closePanel("serverPanel")}} className={`rounded-btn flex justify-center py-2 px-2.5 hover:bg-neutral ${pathname.endsWith("/chat") ? "bg-base-100" : ""}`}>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.556 8.5h8m-8 3.5H12m7.111-7H4.89a.896.896 0 0 0-.629.256.868.868 0 0 0-.26.619v9.25c0 .232.094.455.26.619A.896.896 0 0 0 4.89 16H9l3 4 3-4h4.111a.896.896 0 0 0 .629-.256.868.868 0 0 0 .26-.619v-9.25a.868.868 0 0 0-.26-.619.896.896 0 0 0-.63-.256Z"/>
              </svg>
            </button>
          </div>
          <div className="flex lg:flex-col gap-3">
            <button onClick={() => router.push(`/`)} className="rounded-btn flex justify-center py-2 px-2.5 hover:bg-neutral">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.143 4H4.857A.857.857 0 0 0 4 4.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 10 9.143V4.857A.857.857 0 0 0 9.143 4Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 20 9.143V4.857A.857.857 0 0 0 19.143 4Zm-10 10H4.857a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286A.857.857 0 0 0 9.143 14Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286a.857.857 0 0 0-.857-.857Z"/>
              </svg>
            </button>
            <button onClick={() => signOut()} className="rounded-btn flex justify-center py-2 px-2.5 hover:bg-rose-700">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="w-[22rem] h-full flex flex-col px-8 bg-base-300">
          <div className="h-24 flex justify-between items-center font-bold text-xl">
            {isChannelLoading ? <div style={{ width: "calc(100% - 50px)" }} className="skeleton h-4 bg-base-200"></div> : channelinfo?.name}
            <div className="flex gap-3">
              <button onClick={() => navigator.clipboard.writeText(String(code))} className="mt-3 hover:text-[#c5c5c5]">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"/>
                </svg>
              </button>
              <button onClick={() => closePanel("serverPanel")} className="mt-3 hover:text-[#c5c5c5] lg:hidden">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
                </svg>
              </button>
            </div>
          </div>
          <div style={{ height: "calc(100% - 200px)" }} className="flex flex-col overflow-y-auto text-sm">
            <div className="py-4 text-base font-bold">Users</div>
            {(isUsersLoading || isProfileLoading || isMessagesLoading) ? (
              <div className="flex flex-col gap-6 mt-6">
                <div className="skeleton w-full h-4 bg-base-200"></div>
                <div className="skeleton w-full h-4 bg-base-200"></div>
                <div className="skeleton w-full h-4 bg-base-200"></div>
              </div>
            ) :
            users?.map((user) => (
              <div key={user.id} className={`flex justify-between items-center py-4 px-2 ${!user.isOnline && "opacity-60"}`}>
                <div className="truncate max-w-40">{user.name}</div>
                <div className="flex gap-1 pt-[1px]">
                  {user.role === "OWNER" ?
                    <button className="cursor-default text-blue-500 p-1 rounded-btn">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 0 1-.5-17.986V3c-.354.966-.5 1.911-.5 3a9 9 0 0 0 9 9c.239 0 .254.018.488 0A9.004 9.004 0 0 1 12 21Z"/>
                      </svg>
                    </button> 
                    : user.role === "ADMIN" ?
                      <button className="cursor-default text-blue-500 p-1 rounded-btn">
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 11.5 11 13l4-3.5M12 20a16.405 16.405 0 0 1-5.092-5.804A16.694 16.694 0 0 1 5 6.666L12 4l7 2.667a16.695 16.695 0 0 1-1.908 7.529A16.406 16.406 0 0 1 12 20Z"/>
                        </svg>
                      </button>
                    : ""
                  }
                  {profile?.id !== user.id &&
                    <>
                    <button onClick={() => startCall(user.id)} disabled={!user.isOnline || Boolean(call)} className="hover:bg-neutral p-1 rounded-btn">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.427 14.768 17.2 13.542a1.733 1.733 0 0 0-2.45 0l-.613.613a1.732 1.732 0 0 1-2.45 0l-1.838-1.84a1.735 1.735 0 0 1 0-2.452l.612-.613a1.735 1.735 0 0 0 0-2.452L9.237 5.572a1.6 1.6 0 0 0-2.45 0c-3.223 3.2-1.702 6.896 1.519 10.117 3.22 3.221 6.914 4.745 10.12 1.535a1.601 1.601 0 0 0 0-2.456Z"/>
                      </svg>
                    </button>
                    <button onClick={() => { setData("selectedUser", user); openDialog("userDialog") }} className="hover:bg-neutral p-1 rounded-btn">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="1.5" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      </svg>
                    </button>
                    </>
                  }
                </div>
              </div>              
            ))}
          </div>
          <AnimatePresence>
          {call &&
            <motion.div
              className="h-[68px] flex justify-between px-3 mt-6 bg-base-100 rounded-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <audio className="hidden" ref={localAudioRef} autoPlay muted />
              <audio className="hidden" ref={remoteAudioRef} autoPlay />
              <div className="flex gap-5 items-center">
                <span>
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z"/>
                  </svg>
                </span>
                <div className="flex flex-col text-center gap-1">
                  <div className="text-sm truncate max-w-20">{users?.find(user => user.id === call.peer)?.name}</div>
                  <div className="text-xs">
                    {seconds === 0
                      ? "Calling"
                      : `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 items-center">
              {waitingForAnswer ? 
                <>
                  <button onClick={handleAnswerCall} className="hover:bg-blue-700 p-1 rounded-btn">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                    </svg>
                  </button>
                  <button onClick={handleEndCall} className="hover:bg-rose-700 p-1 rounded-btn">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                    </svg>
                  </button>
                </> : <>
                  <button onClick={toggleMute} className={`hover:bg-rose-700 p-1 rounded-btn ${muted && "bg-rose-700 hover:bg-rose-800"}`}>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 5a7 7 0 0 0-7 7v1.17c.313-.11.65-.17 1-.17h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H6a3 3 0 0 1-3-3v-6a9 9 0 0 1 18 0v6a3 3 0 0 1-3 3h-2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h2c.35 0 .687.06 1 .17V12a7 7 0 0 0-7-7Z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button onClick={handleEndCall} className="hover:bg-rose-700 p-1 rounded-btn">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 6.995c-2.306 0-4.534.408-6.215 1.507-1.737 1.135-2.788 2.944-2.797 5.451a4.8 4.8 0 0 0 .01.62c.015.193.047.512.138.763a2.557 2.557 0 0 0 2.579 1.677H7.31a2.685 2.685 0 0 0 2.685-2.684v-.645a.684.684 0 0 1 .684-.684h2.647a.686.686 0 0 1 .686.687v.645c0 .712.284 1.395.787 1.898.478.478 1.101.787 1.847.787h1.647a2.555 2.555 0 0 0 2.575-1.674c.09-.25.123-.57.137-.763.015-.2.022-.433.01-.617-.002-2.508-1.049-4.32-2.785-5.458-1.68-1.1-3.907-1.51-6.213-1.51Z"/>
                    </svg>
                  </button>
                </>
              }
              </div>
            </motion.div>
          }
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
