import { useState } from 'react';
import { Link } from 'wouter';
import { FileText, LoaderCircle, MessageCircle } from 'lucide-react';
import { reportsAPI } from '@/lib/api';

interface ImageDraft {
  status: 'draft';
  content: {
    image_observations: string[];
    technical_limitations: string[];
    uncertainty_note: string;
  };
  disclaimer: string;
  persisted: false;
  provenance: {
    model: string;
    promptVersion: string;
    retrievedChunkIds: string[];
    retrievedSources?: Array<{
      title: string;
      source: string;
      year?: string | null;
      url?: string | null;
    }>;
  };
}

interface ImageReviewDraftProps {
  medicalImageId: string;
}

export function ImageReviewDraft({ medicalImageId }: ImageReviewDraftProps) {
  const [draft, setDraft] = useState<ImageDraft | null>(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDraft = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const result = await reportsAPI.generateImageDraft(medicalImageId);
      setDraft(result as ImageDraft);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not generate the image-review draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-primary-600 bg-primary-700 p-6 md:p-8" aria-labelledby="image-draft-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-primary-300">
            <FileText aria-hidden="true" size={16} />
            <span>Visual review draft</span>
          </div>
          <h2 id="image-draft-title" className="text-xl font-semibold text-white">Ultrasound image review</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-200">
            MedGemma can describe visible image features. It does not grade fibrosis, and this draft has no retrieved guideline context.
          </p>
        </div>
        <button
          type="button"
          onClick={generateDraft}
          disabled={isGenerating}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 py-2 font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating && <LoaderCircle className="animate-spin" aria-hidden="true" size={17} />}
          {isGenerating ? 'Generating draft' : draft ? 'Regenerate draft' : 'Generate image draft'}
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-md border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-100" role="alert">
          {error}
        </p>
      )}

      {draft && (
        <div className="mt-6 border-t border-primary-600 pt-5" aria-live="polite">
          <p className="mb-5 text-sm font-medium text-amber-200">Draft, not saved. Requires clinician review.</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-white">Visible observations</h3>
              {draft.content.image_observations.length > 0 ? (
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-primary-200">
                  {draft.content.image_observations.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                </ul>
              ) : <p className="mt-2 text-sm text-primary-300">No observations returned.</p>}
            </div>
            <div>
              <h3 className="font-medium text-white">Image limitations</h3>
              {draft.content.technical_limitations.length > 0 ? (
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-primary-200">
                  {draft.content.technical_limitations.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                </ul>
              ) : <p className="mt-2 text-sm text-primary-300">No limitations returned.</p>}
              <h3 className="mt-5 font-medium text-white">Uncertainty</h3>
              <p className="mt-2 text-sm leading-6 text-primary-200">{draft.content.uncertainty_note}</p>
            </div>
          </div>
          <p className="mt-5 border-t border-primary-600 pt-4 text-xs leading-5 text-primary-300">
            {draft.disclaimer} Model: {draft.provenance.model}. Prompt: {draft.provenance.promptVersion}.
            {draft.provenance.retrievedChunkIds && draft.provenance.retrievedChunkIds.length > 0
              ? ` Grounded in ${draft.provenance.retrievedChunkIds.length} guideline chunks from liver_fibrosis_vectordb.`
              : ' No source documents were retrieved.'}
          </p>
        </div>
      )}

      <Link
        href={`/chat?medicalImageId=${encodeURIComponent(medicalImageId)}`}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-pink-400 bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-pink-300 hover:bg-pink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
      >
        <MessageCircle aria-hidden="true" size={17} />
        Start conversation with assistant
      </Link>
    </section>
  );
}