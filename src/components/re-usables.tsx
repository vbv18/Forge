export function GrayTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`text-white/90 ${className}`}>{children}</span>;
}

export function BlueTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-linear-to-br font-serif from-blue-300 via-blue-400 to-blue-600 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`inline-flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-[0.14em] uppercase mb-4 ${className}`}
    >
      <span className="w-4 h-px bg-blue-400" />
      {children}
      <span className="w-4 h-px bg-blue-400" />
    </p>
  );
}

export function SectionHeading({
  gray,
  blue,
  className = "",
}: {
  gray: string;
  blue: string;
  className?: string;
}) {
  return (
    <h1 className="mx-auto p-2 max-w-3xl text-balance font-serif text-5xl loading-tight tracking-tight sm:text-5xl lg:text-7xl z-10">
      <GrayTitle>{gray}</GrayTitle>
      <br />
      <BlueTitle>{blue}</BlueTitle>
    </h1>
  );
}
