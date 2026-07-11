import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (email) setSent(true);
  };

  return (
    <section
      className="newsletter page-section section-reveal"
      aria-labelledby="newsletter-title"
    >
      <div>
        <h2 id="newsletter-title">
          Fresh finds,
          <br />
          without the clutter.
        </h2>
      </div>
      {sent ? (
        <div className="success-message" role="status">
          <CheckIcon aria-hidden="true" />{' '}
          <div>
            <strong>You are on the list.</strong>
            <p>We will only write when there is something worth sharing.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor="email">Email address</label>
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <button className="pressable" aria-label="Join newsletter">
              <ArrowRightIcon aria-hidden="true" />
            </button>
          </div>
          <p>No clutter. Unsubscribe whenever you like.</p>
        </form>
      )}
    </section>
  );
}
