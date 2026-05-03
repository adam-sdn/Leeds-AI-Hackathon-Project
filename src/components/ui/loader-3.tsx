export function Loader3() {
  return (
    <div className="loader-3" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={`loader-3__box loader-3__box${index}`}>
          <div />
        </div>
      ))}
      <div className="loader-3__ground">
        <div />
      </div>
    </div>
  );
}

export const Component = Loader3;
