import { SignIn } from "@clerk/nextjs";

const Page = () => {
  return (
    <div className="flex justify-center py-24">
      <SignIn fallbackRedirectUrl="/"/>
    </div>
  );
}

export default Page;