type RedFlagAlertProps = {
  onStartAgain: () => void;
};

export default function RedFlagAlert({ onStartAgain }: RedFlagAlertProps) {
  return (
    <section className="red-flag-card" role="alert">
      <p className="eyebrow">Urgent guidance</p>

      <h2>Some of your signals need immediate attention.</h2>

      <p>
        Based on what you shared, consider calling <strong>999</strong> or going
        to <strong>A&amp;E</strong> now. Do not wait for a routine appointment
        if symptoms feel severe, sudden, or worsening.
      </p>

      <p className="disclaimer">
        This is not a medical diagnosis. If you are unsure or concerned, seek
        urgent medical help.
      </p>

      <button onClick={onStartAgain}>Start another check</button>
    </section>
  );
}
