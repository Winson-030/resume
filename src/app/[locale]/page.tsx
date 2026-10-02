import { getMessages } from "@/i18n/request";
import { HomeClient } from "./HomeClient";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomePageProps) {
  const resolvedParams = await params;
  const messages = await getMessages(resolvedParams.locale);

  return <HomeClient messages={messages} />;
}
