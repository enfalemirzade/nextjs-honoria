"use client";

import axios from "axios";
import useSWR from "swr";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState, useRef } from "react";
import { Message, Profile } from "@/types/models";
import { addToList } from "@/utils/updateList";
import { chatSchema } from "@/schema/schemas";
import { sortChat } from "@/utils/listSorter";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

export function Chat() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { code }: { code: string } = useParams()

  const { data: messages, isLoading:isMessagesLoading } = useSWR<Message[]>(`/api/channel/${code}/chat/list`)
  const { data: profile, isLoading:isProfileLoading } = useSWR<Profile>(`/api/user/profile/get`)

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  })

  const {
    register,
    handleSubmit,
    formState: {}, reset
  } = useForm({
    resolver: yupResolver(chatSchema),
    mode: 'onSubmit'
  })

  const onSubmit = async (data: { content: string }) => {
    if(!profile) return

    setLoading(true)
    setError(null)
    reset()

    const preData: Message = {
      id: String(Math.floor(10000 + Math.random() * 90000)),
      content: data.content,
      senderId: profile.id,
      sender: {
        name: profile.name
      },
      server: {
        code: code
      }
    }

    addToList(`/api/channel/${code}/chat/list`, preData, sortChat)

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({behavior: 'smooth'})
    }, 100)

    const reqData = {
      content: data.content,
      code: code
    }

    try {
      await axios.post(`/api/channel/${code}/chat/add`, reqData)
    } catch (error: unknown) {
      console.error(error)
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return(
    <>
      <div className="h-full overflow-y-auto">
        {isMessagesLoading || isProfileLoading ? (
          <div className="h-full flex justify-center items-center bg-transparent text-[#ebebeb]">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) :
        !messages?.length ?
        <div className="flex justify-center items-center gap-2 text-[#c5c5c5]">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.122 17.645a7.185 7.185 0 0 1-2.656 2.495 7.06 7.06 0 0 1-3.52.853 6.617 6.617 0 0 1-3.306-.718 6.73 6.73 0 0 1-2.54-2.266c-2.672-4.57.287-8.846.887-9.668A4.448 4.448 0 0 0 8.07 6.31 4.49 4.49 0 0 0 7.997 4c1.284.965 6.43 3.258 5.525 10.631 1.496-1.136 2.7-3.046 2.846-6.216 1.43 1.061 3.985 5.462 1.754 9.23Z"/>
          </svg>
          <span>Send first message</span>
        </div> :
        messages?.map((message, index) => (
          <div key={message.id} className={`chat ${message.senderId === profile?.id ? "chat-end" : "chat-start"}`}>
            {(!messages[index - 1] || messages[index - 1].senderId !== message.senderId) &&
              <div className="chat-header mb-1 mx-1">
                <span className="max-w-[50%] truncate text-[#c5c5c5]">{message.sender.name}</span>
              </div>
            }
            <div className="chat-bubble min-h-6 pt-[5px] my-0.5 text-sm max-w-[50%] break-all text-[#ebebeb]">{message.content}</div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <form className="relative" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <input className="input input-bordered text-sm h-11 pr-14 w-full" type="text" placeholder="Message" {...register('content')}/>
        <button disabled={loading} className="text-blue-500 hover:text-blue-600 absolute right-3 top-0 h-full">
          {loading ? <span className="loading loading-spinner loading-sm mt-1.5"></span> :
            error ? 
            <svg className="text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
            </svg> :
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clipRule="evenodd"/>
            </svg>
          }
        </button>
      </form>
    </>
  )
}
