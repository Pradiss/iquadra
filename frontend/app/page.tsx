import { redirect } from "next/navigation";

const ACADEMIA_PADRAO_SLUG = "boa-bola";

export default function HomePage() {
  redirect(`/a/${ACADEMIA_PADRAO_SLUG}`);
}