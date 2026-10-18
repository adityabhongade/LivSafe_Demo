import { useEffect } from 'react';
import { ChatWindow } from '@/components/ChatWindow';

export default function ChatPage() {
  const medicalImageId = new URLSearchParams(window.location.search).get('medicalImageId') || undefined;

  useEffect(() => {
    document.title = medicalImageId
      ? 'Ultrasound image conversation | LivSafe'
      : 'Medical conversation | LivSafe';
  }, [medicalImageId]);

  return <ChatWindow medicalImageId={medicalImageId} />;
}
