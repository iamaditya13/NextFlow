export const UseCasesVideo = () => {
  return (
    <div className="sticky box-border basis-[0%] grow w-full z-[1] mb-auto top-[68px] md:top-24">
      <div className="relative aspect-video bg-neutral-100 shadow-[rgba(0,0,0,0)_0px_0px_0px_0px,rgba(0,0,0,0)_0px_0px_0px_0px,rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px] box-border overflow-hidden rounded-[10px]">
        <div className="absolute bg-[linear-gradient(rgb(50,50,50)_0.5%,rgba(0,0,0,0)_100%)] box-border h-1/4 z-20 overflow-hidden inset-x-0 top-0"></div>
        <div className="absolute bg-[oklab(0.9219_0.000418723_0.000184774/_0.4)] box-border h-1 z-20 overflow-hidden left-0 right-0 top-0"></div>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls
          poster="/assets/imageToolDemo_usecases-poster.jpg"
          className="relative box-border h-full max-w-full w-full object-cover z-0"
        >
          <source src="/assets/imageToolDemo_usecases.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};
