"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PusherError } from "@/components/error/PusherError";
import { useFriendsStore } from "@/store/friendsStore";
import { Channel, Members } from "pusher-js";
import { pusher } from "@/lib/pusher";
import { useSWRConfig } from "swr";

interface PusherContextProps {
  children: React.ReactNode
  channelName: string
}

interface PusherContextValue {
  channel: Channel | null
  members: Members | null
}

const PusherContext = createContext<PusherContextValue | undefined>(undefined)

export const PusherProvider: React.FC<PusherContextProps> = ({ children, channelName }) => {
  const [channel, setChannel] = useState<Channel | null>(null)
  const [members, setMembers] = useState<Members | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { updateFriends } = useFriendsStore()
  const { cache, mutate } = useSWRConfig()

  useEffect(() => {
    if (!pusher.user.signin_requested) {
      pusher.signin()

      pusher.connection.bind("error", function (err: unknown) {
        setError("Connection Error" + err)
      })

      pusher.connection.bind("disconnected", function () {
        pusher.connect()
      })

      pusher.user.watchlist.bind('online', updateFriends)
      pusher.user.watchlist.bind('offline', updateFriends)
    }

    if (pusher.channels.find(channelName)) return

    if (channelName.startsWith("private-user-")) {
      const privateChannel = pusher.subscribe(channelName)
      setChannel(privateChannel)

      privateChannel.bind("pusher:subscription_error", (err: unknown) => {
        setError("Private Connection Error" + err)
      })
    }

    else if(channelName.startsWith("presence")) {
      pusher.channels.all().forEach((channel) => {
        if(channel.name.startsWith("presence")) {
          channel.unbind_all()
          channel.unsubscribe()
          pusher.channels.remove(channel.name)
  
          Array.from(cache.keys()).forEach((key) => {
            if (key.includes(channel.name.split("-")[2])) {
              mutate(key, undefined)
            }
          })
        }
      })

      const currentChannel = pusher.subscribe(channelName)

      currentChannel.bind("pusher:subscription_succeeded", (members: Members) => {
        setMembers(members)
      })

      setChannel(currentChannel)
      setError(null)

      currentChannel.bind("pusher:subscription_error", (err: unknown) => {
        setError("Connection Error" + err)
      })
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache, channelName, mutate])

  if(error) {
    return (
      <PusherError />
    )
  }

  return (
    <PusherContext.Provider value={{ channel, members }}>
      {children}
    </PusherContext.Provider>
  )
}

export const usePusher = (): PusherContextValue => {
  const context = useContext(PusherContext)
  if (!context) throw new Error()
  return context
}
