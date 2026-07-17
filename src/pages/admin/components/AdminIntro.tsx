interface AdminIntroProps {
  title: string;
  body: string;
}

export function AdminIntro({ title, body }: AdminIntroProps) {
  return (
    <div className="dashboard-intro">
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}
