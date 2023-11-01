import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { getFirebaseFileUrl } from "@/lib/firebase";
import { loadCloudStorageIntoPinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// api/create-chat
export async function POST(req: Request, res: Response) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ erorr: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fileName, fileKey } = body;
    await loadCloudStorageIntoPinecone(fileKey);

    const downloadUrl = await getFirebaseFileUrl(fileKey);
    // const chatId = await db
    //   .insert(chats)
    //   .values({
    //     fileKey: fileKey,
    //     pdfName: fileName,
    //     pdfUrl: downloadUrl || "",
    //     userId,
    //   })
    //   .returning({
    //     insertedId: chats.id,
    //   });

    return NextResponse.json(
      {
        chatId: downloadUrl, //chatId[0].insertedId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
