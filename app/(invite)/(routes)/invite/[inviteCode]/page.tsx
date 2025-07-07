import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
    params: Promise<{ inviteCode: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const InviteCodePage = async ({
    params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<any> => {
    const { inviteCode } = await params;
    const profile = await currentProfile();

    if (!profile) {
        return redirect("/sign-in");
    }

    if (!inviteCode) {
        return redirect("/");
    }

    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if (existingServer) {
        return redirect(`/servers/${existingServer.id}`);
    }

    const server = await db.server.update({
        where: {
            inviteCode: inviteCode,
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id,
                    }
                ]
            }
        }
    });

    if (server) {
        return redirect(`/servers/${server.id}`)
    }

    return undefined;
}

export default InviteCodePage;