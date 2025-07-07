import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

interface ServerIdPageProps {
    params: {
        serverId: string;
    }
};

type Props = {
    params: Promise<{ serverId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const ServerIdPage = async ({
    params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<any> => {
    const { serverId } = await params;
    const profile = await currentProfile();
    
    if(!profile) {
        return redirect("/sign-in");
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id,
                }
            }
        },
        include: {
            channels: {
                where: {
                    name: "general"
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    });

    const initialChannel = server?.channels[0];

    if(initialChannel?.name !== "general") {
        return null;
    }

    return redirect(`/servers/${serverId}/channels/${initialChannel?.id}`)
}
 
export default ServerIdPage;