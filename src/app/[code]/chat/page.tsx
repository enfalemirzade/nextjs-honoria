import { Chat } from "@/components/Chat"

export default function ChatPage() {
  return(
    <div style={{ height: "calc(100% - 80px)" }} className="flex flex-col px-6 py-4 gap-6">
      <Chat />
    </div>
  )
}
