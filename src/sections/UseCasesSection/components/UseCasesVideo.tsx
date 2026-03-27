export const UseCasesVideo = () => {
  return (
    <div className="sticky box-border basis-[0%] grow w-full z-[1] mb-auto top-[68px] md:top-24">
      <div className="relative aspect-video bg-neutral-100 shadow-[rgba(0,0,0,0)_0px_0px_0px_0px,rgba(0,0,0,0)_0px_0px_0px_0px,rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px] box-border overflow-hidden rounded-[10px]">
        <div className="absolute bg-[linear-gradient(rgb(50,50,50)_0.5%,rgba(0,0,0,0)_100%)] box-border h-1/4 z-20 overflow-hidden inset-x-0 top-0"></div>
        <div className="absolute bg-[oklab(0.9219_0.000418723_0.000184774/_0.4)] box-border h-1 z-20 overflow-hidden left-0 right-0 top-0"></div>
        <div className="bg-white box-border h-full w-[0%] rounded-[3.35544e+07px] top-1.5 inset-x-1.5"></div>
        <video
          autoPlay
          playsInline
          preload="metadata"
          controls
          src="/assets/imageToolDemo_lowBitrate.mp4"
          className="relative box-border h-full max-w-full w-full z-0"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};
