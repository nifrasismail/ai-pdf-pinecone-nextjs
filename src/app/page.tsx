import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  return (
    <div className="flex flex-col pl-2 pr-2 w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100 items-center justify-center">
      <UserButton afterSignOutUrl="/" />
      <h1 className="text-3xl font-semibold pb-4 text-center">
        Reading Expert
      </h1>

      <div className="flex m-2">
        {isAuth && <Button className="bg-black text-white">Ask to PDF</Button>}
      </div>

      <p className="max-w-xl mt-2 text-lg text-center text-gray-600">
        Join millions of people to understand the books, documents or any PDF
        resources without reading it.
      </p>

      <div className="mt-4">
        {isAuth ? (
          <FileUpload />
        ) : (
          <Link href="/sign-in">
            <Button className="bg-black text-white">
              Login to get Started!
              <LogIn className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
