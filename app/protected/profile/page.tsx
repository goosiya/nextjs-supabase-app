import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

async function ProfileContent() {
  const supabase = await createClient();

  // 현재 로그인한 사용자 확인
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/sign-in");
  }

  const userId = data.claims.sub as string;

  // profiles 테이블에서 프로필 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return (
    <ProfileForm
      userId={userId}
      userEmail={data.claims.email as string}
      profile={profile}
    />
  );
}

export default function ProfilePage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 px-4 py-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">프로필 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">
          공개 프로필 정보를 관리합니다.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">로딩 중...</p>}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
