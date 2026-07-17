interface PageIntroProps {
  title: string;
  body?: string;
}

export function PageIntro({ title, body }: PageIntroProps) {
  return (
    <div className="page-intro">
      <h1>{title}</h1>
      {body && <p>{body}</p>}
    </div>
  );
}
