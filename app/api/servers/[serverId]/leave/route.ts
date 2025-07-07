import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
    params: Promise<{ serverId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function PATCH(
 req: Request,
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<NextResponse> {
    try {
        const { serverId } = await params;
        const profile = await currentProfile();

        if(!profile) {
            return new NextResponse("Unathorized", { status: 401 });
        }

        if(!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: {
                    not: profile.id
                },
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id
                    }
                }
            }
        });
        
        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_LEAVE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}