interface VendorIntroProps {
  title: string;
  body: string;
}

export function VendorIntro({ title, body }: VendorIntroProps) {
  return (
    <div className="dashboard-intro">
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}
