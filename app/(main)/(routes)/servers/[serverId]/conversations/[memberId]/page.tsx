import { redirect } from "next/navigation";

import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";
import { Metadata, ResolvingMetadata } from "next";

interface MemberIdPageProps {
    params: {
        memberId: string;
        serverId: string;
    },
    searchParams: {
        video?: boolean;
    }
}

type Props = {
    params: Promise<{ memberId: string, serverId: string }>
    searchParams: Promise<{ video?: boolean }>
}

const MemberIdPage = async ({
    params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<any> => {
    const { serverId, memberId } = await params;
    const { video } = await searchParams;
    const profile = await currentProfile();

    if (!profile) {
        return redirect("/sign-in");
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId: serverId,
            profileId: profile.id,
        },
        include: {
            profile: true
        }
    });

    if(!currentMember) return null;

    if (!currentProfile) {
        return redirect("/");
    }

    const conversation = await getOrCreateConversation(currentMember.id, memberId);

    if (!conversation) {
        return redirect(`/servers/${serverId}`);
    }

    const { memberOne, memberTwo } = conversation;

    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

    return (
        <div className="bg-wihte dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                imageUrl={otherMember.profile.imageUrl}
                name={otherMember.profile.name}
                serverId={serverId}
                type="conversation"
            />
            {video && (
                <MediaRoom 
                    chatId={conversation.id}
                    video={true}
                    audio={true}
                />
            )}
            {!video && (
                <>
                    <ChatMessages
                        member={currentMember}
                        name={otherMember.profile.name}
                        chatId={conversation.id}
                        type="conversation"
                        apiUrl="/api/direct-messages"
                        paramKey="conversationId"
                        paramValue={conversation.id}
                        socketUrl="/api/socket/direct-messages"
                        socketQuery={{
                            conversationId: conversation.id
                        }}
                    />
                    <ChatInput
                        name={otherMember.profile.name}
                        type="conversation"
                        apiUrl="/api/socket/direct-messages"
                        query={{
                            conversationId: conversation.id
                        }}
                    />
                </>
            )}

        </div>
    );
}

export default MemberIdPage;