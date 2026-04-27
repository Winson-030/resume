import { getMessages } from "@/i18n/request";
import { HomeClient } from "./HomeClient";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps) {
  const resolvedParams = await params;
  const messages = await getMessages(resolvedParams.locale);
  return {
    title: `${messages.hero.name} - ${messages.hero.title}`,
    description: messages.hero.description,
  };
}

export default async function Home({ params }: HomePageProps) {
  const resolvedParams = await params;
  const messages = await getMessages(resolvedParams.locale);

  return <HomeClient messages={messages} />;
}
