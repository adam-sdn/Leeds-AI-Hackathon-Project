export default function CubeLoader() {
  return (
    <div className="cube-loader">
      <div className="cube-loader__scene">
        <div className="cube-loader__cube">
          <div className="cube-loader__core" />
          <div className="side-wrapper front"><div className="face face-cyan" /></div>
          <div className="side-wrapper back"><div className="face face-cyan" /></div>
          <div className="side-wrapper right"><div className="face face-blue" /></div>
          <div className="side-wrapper left"><div className="face face-blue" /></div>
          <div className="side-wrapper top"><div className="face face-indigo" /></div>
          <div className="side-wrapper bottom"><div className="face face-indigo" /></div>
        </div>
        <div className="cube-loader__shadow" />
      </div>

      <div className="cube-loader__text">
        <h3>Loading</h3>
        <p>Preparing your assessment, please wait...</p>
      </div>
    </div>
  );
}
