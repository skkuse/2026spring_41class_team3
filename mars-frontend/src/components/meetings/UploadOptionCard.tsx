import { Mic, Upload } from 'lucide-react';

type UploadOptionCardProps = {
  title: string;
  description: string;
  icon: 'upload' | 'record';
};

function UploadOptionCard({ title, description, icon }: UploadOptionCardProps) {
  const Icon = icon === 'upload' ? Upload : Mic;

  return (
    <button
      type="button"
      className="group flex min-h-32 flex-col items-center justify-center rounded-lg border border-border bg-secondary px-5 py-6 text-center transition hover:border-primary/70 hover:bg-primary/10 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-xl text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <span className="mt-4 text-base font-semibold text-foreground">
        {title}
      </span>
      <span className="mt-1 text-sm text-muted-foreground">{description}</span>
    </button>
  );
}

export default UploadOptionCard;
