import ContentContext from "@/context/ContentContext";
import { ProfilePanel } from "@/components/panel/ProfilePanel";
import { UpdatePanel } from "@/components/panel/UpdatePanel";
import { PusherProvider } from "@/context/PusherContext";
import { ServerList } from "@/components/ServerList";
import { Dialogs } from "@/components/Dialogs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <ContentContext>
      <PusherProvider channelName={`private-user-${session?.user.id}`}>
        <Dialogs />
        <ProfilePanel />
        <ServerList />
        <UpdatePanel />
      </PusherProvider>
    </ContentContext>
  )
}
