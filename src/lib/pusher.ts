import PusherServer from "pusher";
import Pusher from "pusher-js";

export const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  cluster: 'eu',
  userAuthentication: {
    endpoint: "/api/auth/pusherauth/user",
    transport: "ajax"
  },
  channelAuthorization: {
    endpoint: "/api/auth/pusherauth/channel",
    transport: "ajax"
  }
})

export const pusherServer = new PusherServer({
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  appId: process.env.PUSHER_APP_ID!,
  cluster: 'eu',
  useTLS: true
})

const RETRY_DELAY = 2000
const MAX_RETRIES = 6

export async function sendToUser(id: string, type: string, data: unknown) {
  let count = 0

  async function trySending() {
    try {
      await pusherServer.sendToUser(id, type, data)
    } catch (err) {
      if (count < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        await trySending()
        count++
      } else {
        console.error("Max retries reached. Could not send the data." + err)
      }
    }
  }

  await trySending()
}

export async function triggerPusher(id: string, type: string, data: unknown) {
  let count = 0

  async function trySending() {
    try {
      await pusherServer.trigger(id, type, data)
    } catch (err) {
      if (count < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        await trySending()
        count++
      } else {
        console.error("Max retries reached. Could not send the data." + err)
      }
    }
  }

  await trySending()
}
