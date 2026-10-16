import { useEffect, useState, type FormEvent } from 'react';

import { links } from '../lib/config';

interface Field {
  id: string;
  label: string;
  kind: string;
  required: boolean;
  inputType?: string;
  choices?: { value: string; label: string }[];
}

const input =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20';

/**
 * Your own design for a form from the app. It reads the form's questions (so a
 * new question shows up here without a code change), draws them with your own
 * Tailwind classes and sends the answers straight to the form's address.
 * Nothing from the app's own look is used.
 */
export function ContactForm({ form }: { form: string }) {
  const endpoint = `${links.api}/public/forms/${form}`;
  const [fields, setFields] = useState<Field[]>([]);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(endpoint)
      .then((response) => response.json())
      .then((view) => setFields((view.fields ?? []).filter((field: Field) => field.kind !== 'file')))
      .catch(() => setState('failed'));
  }, [endpoint]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    const response = await fetch(endpoint, {
      method: 'POST',
      // Asking for JSON gives {"message": "…"} back instead of a page.
      headers: { Accept: 'application/json' },
      body: new URLSearchParams(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>),
    });
    const answer = await response.json().catch(() => ({}));
    setMessage(answer.message ?? '');
    setState(response.ok ? 'done' : 'failed');
  }

  if (state === 'done') {
    return (
      <p role="status" className="rounded-xl bg-emerald-50 px-5 py-4 text-emerald-900">
        {message || 'Thank you!'}
      </p>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-4">
      {fields.map((field) => (
        <label key={field.id} className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          {field.label}
          {field.kind === 'select' ? (
            <select name={field.id} required={field.required} className={input}>
              <option value="">Choose…</option>
              {field.choices?.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          ) : field.inputType === 'textarea' ? (
            <textarea name={field.id} required={field.required} rows={4} className={input} />
          ) : (
            <input
              name={field.id}
              required={field.required}
              type={field.inputType === 'email' ? 'email' : field.inputType === 'phone' ? 'tel' : 'text'}
              className={input}
            />
          )}
        </label>
      ))}
      {/* Catches spam bots: people never see it, so leave it in. */}
      <input type="text" name="_website" tabIndex={-1} autoComplete="off" hidden />
      <button
        type="submit"
        disabled={state === 'sending' || fields.length === 0}
        className="self-start rounded-full bg-stone-900 px-6 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        Send
      </button>
      {state === 'failed' && (
        <p role="alert" className="text-sm text-red-700">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
