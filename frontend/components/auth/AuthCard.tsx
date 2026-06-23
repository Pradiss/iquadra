import Image from "next/image";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function AuthCard({
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-[420px] rounded-[30px] bg-white px-5 py-8 shadow-[0_26px_90px_rgba(4,12,24,0.22)] sm:px-8 sm:py-10 md:px-10 md:py-12">
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="IQuadra"
          width={124}
          height={32}
          className="mx-auto "
        />

        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-gray-900">
          {title}
        </h1>

        <p className="mt-2 text-[14px] font-normal leading-6 text-gray-400">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}
