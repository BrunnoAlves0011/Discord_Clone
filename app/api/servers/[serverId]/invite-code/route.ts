import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
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
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if(!serverId){
            return new NextResponse("Server ID Missing", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                inviteCode: uuidv4(),
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}