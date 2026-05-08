import { Metadata } from 'next';

const TOOLS_DATA: Record<string, any> = {
  chatgpt: {
    name: 'ChatGPT Plus',
    image: '/sync/covers/chatgpt.png',
    descEn: "Advanced AI assistant powered by OpenAI's latest models.",
    descAr: "مساعد الذكاء الاصطناعي المتقدم والمدعوم بأحدث نماذج OpenAI.",
  },
  gemini: {
    name: 'Gemini Advanced',
    image: '/sync/covers/gemini.png',
    descEn: "Google's most capable AI model for highly complex tasks.",
    descAr: "نموذج الذكاء الاصطناعي الأقوى من جوجل للمهام شديدة التعقيد.",
  },
  midjourney: {
    name: 'Midjourney Pro',
    image: '/sync/covers/midjourney.png',
    descEn: 'Industry-leading AI image generation from text descriptions.',
    descAr: 'توليد الصور بالذكاء الاصطناعي بجودة فائقة واحترافية عالية.',
  },
  claude: {
    name: 'Claude Opus',
    image: '/sync/covers/claude.png',
    descEn: 'Highly capable, nuanced, and secure AI model by Anthropic.',
    descAr: 'نموذج ذكاء اصطناعي آمن ودقيق جداً في الكتابة وتحليل البيانات.',
  },
  canva: {
    name: 'Canva Pro',
    image: '/sync/covers/canva.png',
    descEn: 'Design anything, publish anywhere with Canva Pro.',
    descAr: 'صمم أي شيء بمرونة واحترافية مع باقة التصميم الأولى عالمياً.',
  },
  elevenlabs: {
    name: 'ElevenLabs',
    image: '/sync/covers/elevenlabs.png',
    descEn: 'The most realistic AI voice generator and text to speech.',
    descAr: 'مولد الصوت بالذكاء الاصطناعي الأكثر واقعية.',
  }
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = TOOLS_DATA[params.slug];
  
  if (!tool) {
    return {
      title: 'Tool Not Found | SYNC',
    };
  }

  const title = `SYNC | ${tool.name} Premium`;
  const description = `${tool.descAr} - ${tool.descEn}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'SYNC',
      images: [
        {
          url: tool.image || '/sync/covers/gemini.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'ar_EG',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [tool.image || '/sync/covers/gemini.png'],
    },
  };
}

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
