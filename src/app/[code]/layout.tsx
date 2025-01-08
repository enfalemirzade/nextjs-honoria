import ContentContext from "@/context/ContentContext";
import ServerContext from "@/context/ServerContext";
import { ChannelError } from "@/components/error/ChannelError";
import { ServerPanel } from "@/components/panel/ServerPanel";
import { PusherProvider } from "@/context/PusherContext";
import { ServerHead } from "@/components/ServerHead";
import { checkServer } from "@/utils/checkServer";
import { Dialogs } from "@/components/Dialogs";
import { Suspense } from "react";

interface Props {
  children: React.ReactNode;
  params: { code: string }
}

const ChannelLayout = async ({ children, params }: Props) => {
  const { code } = params
  const isValid = await checkServer(code)

  if (!isValid.state || !isValid.userId) {
    return (
      <ChannelError />
    )
  }

  const loading = (
    <div style={{ height: "calc(100% - 80px)" }} className="flex justify-center items-center bg-transparent text-[#ebebeb]">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  )

  return (
    <ContentContext>
      <PusherProvider channelName={`presence-channel-${code}`}>
        <Dialogs />
        <ServerPanel />
        <ServerContext userId={isValid.userId}>
          <ServerHead />
          <Suspense fallback={loading}>
            {children}
          </Suspense>
        </ServerContext>
      </PusherProvider>
    </ContentContext>
  )
}

export default ChannelLayout
