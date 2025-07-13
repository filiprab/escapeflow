interface ComponentHeaderProps {
  name: string;
  description: string;
}

export function ComponentHeader({ name, description }: ComponentHeaderProps) {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg leading-tight">{name}</h3>
        <span className="text-xs text-gray-400 uppercase tracking-wide">Target Component</span>
      </div>
      
      <p className="text-sm leading-relaxed mb-4 text-gray-400">{description}</p>
    </>
  );
}