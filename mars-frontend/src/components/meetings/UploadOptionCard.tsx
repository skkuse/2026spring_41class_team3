type UploadOptionCardProps = {
  title: string;
  description: string;
  icon: 'upload' | 'record';
};

function UploadIcon() {
  return (
    <span className="relative block size-6">
      <span className="absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 rounded-full bg-current" />
      <span className="absolute left-1/2 top-1 size-2 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-current" />
      <span className="absolute bottom-1 left-1/2 h-2 w-5 -translate-x-1/2 rounded-b-md border-x-2 border-b-2 border-current" />
    </span>
  );
}

function RecordIcon() {
  return (
    <span className="relative flex size-6 items-center justify-center">
      <span className="absolute size-5 rounded-full border-2 border-current opacity-60" />
      <span className="size-2.5 rounded-full bg-current" />
    </span>
  );
}

function UploadOptionCard({ title, description, icon }: UploadOptionCardProps) {
  return (
    <button
      type="button"
      className="group flex min-h-32 flex-col items-center justify-center rounded-lg border border-border bg-secondary px-5 py-6 text-center transition hover:border-primary/70 hover:bg-primary/10 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-xl text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        {icon === 'upload' ? <UploadIcon /> : <RecordIcon />}
      </span>
      <span className="mt-4 text-base font-semibold text-foreground">
        {title}
      </span>
      <span className="mt-1 text-sm text-muted-foreground">{description}</span>
    </button>
  );
}

export default UploadOptionCard;
