import { SignIn } from "@clerk/nextjs";
import React from "react";

export default function Page() {
  return (
    <div className="flex w-screen min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
